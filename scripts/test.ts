import { execFileSync, execSync, spawn, type ChildProcess } from 'node:child_process'
import {
  mkdirSync,
  writeFileSync,
  appendFileSync,
  readFileSync,
  existsSync,
} from 'node:fs'
import { createServer as createNetServer } from 'node:net'
import { homedir } from 'node:os'
import { join } from 'node:path'

/**
 * Test harness for GrooveCart.
 *
 * Starts the Stripe emulator, runs a single Playwright spec file against the
 * local e2e server, then uploads Replay recordings for failures when
 * `RECORD_REPLAY_API_KEY` is available through `exec-secrets`. The catalog is
 * static JSON, so no database setup is needed.
 *
 * Run via `npm run test tests/<file>.spec.ts`.
 */

const args = process.argv.slice(2)
const uploadAll = args.includes('--upload-all-recordings')
const requestedTestFile = args.find((a) => !a.startsWith('--'))

if (!requestedTestFile) {
  console.error('Usage: npm run test [-- --upload-all-recordings] tests/<file>.spec.ts')
  process.exit(2)
}

const testFile = requestedTestFile

mkdirSync('logs', { recursive: true })
let n = 1
while (existsSync(`logs/test-run-${n}.log`)) n++
const LOG = `logs/test-run-${n}.log`
writeFileSync(LOG, `test run ${new Date().toISOString()} - ${testFile}\n`)
const log = (s: string) => appendFileSync(LOG, s.endsWith('\n') ? s : s + '\n')

type EmulatorService =
  | 'stripe'
  | 'resend'
  | 'google'
  | 'apple'
  | 'microsoft'
  | 'okta'
  | 'clerk'

interface EmulatorDefinition {
  service: EmulatorService
  port: number
  readyPath: string
}

const EMULATORS: Record<EmulatorService, EmulatorDefinition> = {
  stripe: {
    service: 'stripe',
    port: Number(process.env.STRIPE_EMULATOR_PORT ?? 4009),
    readyPath: '/meta',
  },
  resend: {
    service: 'resend',
    port: Number(process.env.RESEND_EMULATOR_PORT ?? 4008),
    readyPath: '/emails',
  },
  google: {
    service: 'google',
    port: Number(process.env.GOOGLE_EMULATOR_PORT ?? 4002),
    readyPath: '/.well-known/openid-configuration',
  },
  apple: {
    service: 'apple',
    port: Number(process.env.APPLE_EMULATOR_PORT ?? 4004),
    readyPath: '/.well-known/openid-configuration',
  },
  microsoft: {
    service: 'microsoft',
    port: Number(process.env.MICROSOFT_EMULATOR_PORT ?? 4005),
    readyPath: '/.well-known/openid-configuration',
  },
  okta: {
    service: 'okta',
    port: Number(process.env.OKTA_EMULATOR_PORT ?? 4006),
    readyPath: '/.well-known/openid-configuration',
  },
  clerk: {
    service: 'clerk',
    port: Number(process.env.CLERK_EMULATOR_PORT ?? 4011),
    readyPath: '/.well-known/openid-configuration',
  },
}

const STRIPE_API_BASE = `http://127.0.0.1:${EMULATORS.stripe.port}`
const RESEND_API_BASE = `http://127.0.0.1:${EMULATORS.resend.port}`

const AUTH_CLIENTS = {
  google: {
    clientId: 'groovecart-google-client.apps.googleusercontent.com',
    clientSecret: 'groovecart-google-secret',
  },
  apple: {
    clientId: 'com.groovecart.web',
  },
  microsoft: {
    clientId: 'groovecart-microsoft-client',
    clientSecret: 'groovecart-microsoft-secret',
  },
  okta: {
    clientId: 'groovecart-okta-client',
    clientSecret: 'groovecart-okta-secret',
  },
  clerk: {
    clientId: 'groovecart-clerk-client',
    clientSecret: 'groovecart-clerk-secret',
  },
} as const

function execSecrets(secrets: string[], verb: string, verbArgs: string[] = []): string {
  return execFileSync('exec-secrets', [...secrets, '--', verb, ...verbArgs], {
    encoding: 'utf-8',
    timeout: 180_000,
    env: { ...process.env, LC_ALL: 'C' },
  })
}

async function waitForUrl(url: string, timeoutMs = 30_000): Promise<void> {
  const started = Date.now()
  let lastErr: unknown
  while (Date.now() - started < timeoutMs) {
    try {
      const res = await fetch(url)
      if (res.ok || res.status < 500) return
    } catch (err) {
      lastErr = err
    }
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  throw new Error(`Timed out waiting for ${url}: ${String(lastErr)}`)
}

async function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = createNetServer()
    server.once('error', () => resolve(false))
    server.once('listening', () => {
      server.close(() => resolve(true))
    })
    server.listen(port, '127.0.0.1')
  })
}

async function findE2ePort(): Promise<number> {
  if (process.env.E2E_PORT) return Number(process.env.E2E_PORT)
  for (let port = 18_888; port < 18_988; port++) {
    if (await isPortAvailable(port)) return port
  }
  throw new Error('Could not find an available e2e server port')
}

async function startEmulator(
  service: EmulatorService,
  port: number,
  readyUrl: string,
  seedPath: string | null,
): Promise<ChildProcess | null> {
  try {
    await waitForUrl(readyUrl, 1_000)
    log(`using existing ${service} emulator at http://127.0.0.1:${port}`)
    return null
  } catch {
    // Start our own emulator below.
  }

  const child = spawn(
    'npx',
    [
      'emulate',
      'start',
      '--service',
      service,
      '--port',
      String(port),
      ...(seedPath ? ['--seed', seedPath] : []),
    ],
    {
      env: { ...process.env, LC_ALL: 'C' },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  )

  child.stdout?.on('data', (chunk) => log(`[emulate] ${String(chunk)}`))
  child.stderr?.on('data', (chunk) => log(`[emulate] ${String(chunk)}`))

  await waitForUrl(readyUrl)
  log(`started ${service} emulator at http://127.0.0.1:${port}`)
  return child
}

function requiredServices(): EmulatorService[] {
  const services = new Set<EmulatorService>()
  if (testFile.includes('checkout')) {
    services.add('stripe')
    services.add('resend')
  }
  if (testFile.includes('auth')) {
    services.add('google')
    services.add('apple')
    services.add('microsoft')
    services.add('okta')
    services.add('clerk')
  }
  return [...services]
}

function authEnv(): Record<string, string> {
  const googleBase = `http://127.0.0.1:${EMULATORS.google.port}`
  const appleBase = `http://127.0.0.1:${EMULATORS.apple.port}`
  const microsoftBase = `http://127.0.0.1:${EMULATORS.microsoft.port}`
  const oktaBase = `http://127.0.0.1:${EMULATORS.okta.port}`
  const clerkBase = `http://127.0.0.1:${EMULATORS.clerk.port}`

  return {
    GOOGLE_EMULATOR_URL: googleBase,
    GOOGLE_CLIENT_ID: AUTH_CLIENTS.google.clientId,
    GOOGLE_CLIENT_SECRET: AUTH_CLIENTS.google.clientSecret,
    APPLE_EMULATOR_URL: appleBase,
    APPLE_CLIENT_ID: AUTH_CLIENTS.apple.clientId,
    MICROSOFT_EMULATOR_URL: microsoftBase,
    MICROSOFT_CLIENT_ID: AUTH_CLIENTS.microsoft.clientId,
    MICROSOFT_CLIENT_SECRET: AUTH_CLIENTS.microsoft.clientSecret,
    OKTA_EMULATOR_URL: oktaBase,
    OKTA_ISSUER: `${oktaBase}/oauth2/default`,
    OKTA_CLIENT_ID: AUTH_CLIENTS.okta.clientId,
    OKTA_CLIENT_SECRET: AUTH_CLIENTS.okta.clientSecret,
    AUTH0_ISSUER_BASE_URL: `${oktaBase}/oauth2/default`,
    AUTH0_CLIENT_ID: AUTH_CLIENTS.okta.clientId,
    AUTH0_CLIENT_SECRET: AUTH_CLIENTS.okta.clientSecret,
    CLERK_EMULATOR_URL: clerkBase,
    CLERK_CLIENT_ID: AUTH_CLIENTS.clerk.clientId,
    CLERK_CLIENT_SECRET: AUTH_CLIENTS.clerk.clientSecret,
  }
}

function writeAuthSeedConfig(publicBaseUrl: string): string {
  const googleCallback = `${publicBaseUrl}/api/auth/callback/google`
  const appleCallback = `${publicBaseUrl}/api/auth/callback/apple`
  const microsoftCallback = `${publicBaseUrl}/api/auth/callback/microsoft`
  const oktaCallback = `${publicBaseUrl}/api/auth/callback/okta`
  const clerkCallback = `${publicBaseUrl}/api/auth/callback/clerk`
  const path = `/tmp/groovecart-auth-emulate-${process.pid}.yaml`
  const content = `google:
  oauth_clients:
    - client_id: ${AUTH_CLIENTS.google.clientId}
      client_secret: ${AUTH_CLIENTS.google.clientSecret}
      name: GrooveCart Google
      redirect_uris:
        - ${googleCallback}
apple:
  oauth_clients:
    - client_id: ${AUTH_CLIENTS.apple.clientId}
      team_id: TEAM001
      name: GrooveCart Apple
      redirect_uris:
        - ${appleCallback}
microsoft:
  oauth_clients:
    - client_id: ${AUTH_CLIENTS.microsoft.clientId}
      client_secret: ${AUTH_CLIENTS.microsoft.clientSecret}
      name: GrooveCart Microsoft
      redirect_uris:
        - ${microsoftCallback}
okta:
  oauth_clients:
    - client_id: ${AUTH_CLIENTS.okta.clientId}
      client_secret: ${AUTH_CLIENTS.okta.clientSecret}
      name: GrooveCart Okta
      redirect_uris:
        - ${oktaCallback}
      auth_server_id: default
clerk:
  oauth_applications:
    - client_id: ${AUTH_CLIENTS.clerk.clientId}
      client_secret: ${AUTH_CLIENTS.clerk.clientSecret}
      name: GrooveCart Clerk
      redirect_uris:
        - ${clerkCallback}
`
  writeFileSync(path, content)
  return path
}

async function startRequiredEmulators(seedPath: string | null): Promise<ChildProcess[]> {
  const children: ChildProcess[] = []
  for (const service of requiredServices()) {
    const definition = EMULATORS[service]
    const base = `http://127.0.0.1:${definition.port}`
    const child = await startEmulator(
      service,
      definition.port,
      `${base}${definition.readyPath}`,
      seedPath,
    )
    if (child) children.push(child)
  }
  return children
}

async function stopProcess(child: ChildProcess | null): Promise<void> {
  if (!child || child.exitCode !== null) return
  await new Promise<void>((resolve) => {
    child.once('exit', () => resolve())
    child.kill('SIGTERM')
    setTimeout(() => {
      if (child.exitCode === null) child.kill('SIGKILL')
    }, 2_000).unref()
  })
}

async function main(): Promise<number> {
  try {
    execSync('kill-stale', { stdio: 'ignore' })
  } catch {
    // best-effort
  }

  try {
    execSync('npx replayio remove --all', { stdio: 'ignore' })
  } catch {
    // ignore
  }

  let exitCode = 1
  let emulators: ChildProcess[] = []
  try {
    const e2ePort = await findE2ePort()
    const publicBaseUrl = process.env.PUBLIC_BASE_URL ?? `http://localhost:${e2ePort}`
    const seedPath = writeAuthSeedConfig(publicBaseUrl)
    emulators = await startRequiredEmulators(seedPath)
    const providerEnv = authEnv()
    const out = execSync(
      `npx playwright test ${JSON.stringify(testFile)} --retries 0 --workers 1`,
      {
        encoding: 'utf-8',
        stdio: ['ignore', 'pipe', 'pipe'],
        env: {
          ...process.env,
          LC_ALL: 'C',
          STRIPE_API_BASE,
          STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ?? 'sk_test_emulated',
          RESEND_API_BASE,
          RESEND_EMULATOR_URL: RESEND_API_BASE,
          RESEND_API_KEY: process.env.RESEND_API_KEY ?? 're_test_emulated',
          EMAIL_FROM: process.env.EMAIL_FROM ?? 'GrooveCart <orders@groovecart.test>',
          ...providerEnv,
          E2E_PORT: String(e2ePort),
          PUBLIC_BASE_URL: publicBaseUrl,
        },
        timeout: 300_000,
      },
    )
    log(out)
    exitCode = 0
  } catch (err: unknown) {
    const e = err as { stdout?: string; stderr?: string; status?: number }
    log((e.stdout ?? '') + (e.stderr ?? ''))
    exitCode = e.status ?? 1
  } finally {
    await Promise.all(emulators.map((child) => stopProcess(child)))
  }

  uploadRecordings(exitCode !== 0)

  try {
    execSync('npx replayio remove --all', { stdio: 'ignore' })
  } catch {
    // ignore
  }
  try {
    execSync('kill-stale', { stdio: 'ignore' })
  } catch {
    // ignore
  }

  printSummary(exitCode)
  return exitCode
}

interface CountResult {
  passed: number
  failed: number
  skipped: number
}

function countSpecs(node: { specs?: unknown[]; suites?: unknown[] }, acc: CountResult): void {
  for (const spec of (node.specs ?? []) as Array<{ tests?: Array<{ results?: Array<{ status?: string }> }> }>) {
    for (const t of spec.tests ?? []) {
      const status = t.results?.[t.results.length - 1]?.status
      if (status === 'passed') acc.passed++
      else if (status === 'skipped') acc.skipped++
      else acc.failed++
    }
  }
  for (const sub of (node.suites ?? []) as Array<{ specs?: unknown[]; suites?: unknown[] }>) {
    countSpecs(sub, acc)
  }
}

function parseResults(): CountResult | null {
  try {
    const data = JSON.parse(readFileSync('test-results/results.json', 'utf-8'))
    const acc: CountResult = { passed: 0, failed: 0, skipped: 0 }
    for (const suite of data.suites ?? []) countSpecs(suite, acc)
    if (acc.passed + acc.failed + acc.skipped === 0) return null
    return acc
  } catch {
    return null
  }
}

function uploadRecordings(hadFailures: boolean): void {
  const recLog = join(homedir(), '.replay', 'recordings.log')
  if (existsSync(recLog)) {
    const lines = readFileSync(recLog, 'utf-8')
      .split('\n')
      .filter(Boolean)
      .map((l) => {
        try {
          return JSON.parse(l)
        } catch {
          return null
        }
      })
      .filter((x) => x && x.kind === 'addMetadata' && x.metadata?.test)
    log('\n=== REPLAY RECORDINGS METADATA ===')
    for (const m of lines) {
      log(
        JSON.stringify({
          id: m.id,
          testResult: m.metadata?.test?.result,
          testTitle: m.metadata?.test?.title,
          specFile: m.metadata?.test?.file,
        }),
      )
    }
    log('=== END REPLAY RECORDINGS METADATA ===')
  }

  if (!hadFailures && !uploadAll) return
  try {
    const out = execSecrets(['RECORD_REPLAY_API_KEY'], 'replay-upload-all')
    log('\n=== REPLAY UPLOAD ===\n' + out)
  } catch (e) {
    log(`replay upload skipped or failed: ${String(e)}`)
  }
}

function printSummary(exitCode: number): void {
  const counts = parseResults()
  if (counts) {
    const parts = [`${counts.passed} passed`]
    if (counts.failed) parts.push(`${counts.failed} failed`)
    if (counts.skipped) parts.push(`${counts.skipped} skipped`)
    console.log(`${parts.join(', ')} - see ${LOG}`)
  } else {
    console.log(
      `${exitCode === 0 ? 'tests passed' : 'tests failed'} (no parseable results) - see ${LOG}`,
    )
  }
}

main()
  .then((code) => process.exit(code))
  .catch((err) => {
    log(`harness error: ${err?.stack ?? String(err)}`)
    console.error(`test harness error - see ${LOG}`)
    process.exit(1)
  })
