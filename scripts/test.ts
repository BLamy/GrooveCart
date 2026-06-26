import { execFileSync, execSync } from 'node:child_process'
import {
  mkdirSync,
  writeFileSync,
  appendFileSync,
  readFileSync,
  existsSync,
} from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { initSchema } from './schema'
import { truncateAndSeed } from './seed-db'

/**
 * Test harness for GrooveCart.
 *
 * Creates an ephemeral Neon branch, initializes the schema and seeds it, runs a
 * single Playwright spec file against the Replay browser (Playwright's webServer
 * starts `netlify dev` with DATABASE_URL pointed at the ephemeral branch), then
 * cleans up the branch and uploads Replay recordings for failures.
 *
 * Secrets are NOT in this process's env; every secret-using operation shells out
 * via `exec-secrets <SECRET…> -- <verb>` from the allowlist (see
 * skills/scripts/baseAllowList.md). Run via `npm run test tests/<file>.spec.ts`.
 */

const args = process.argv.slice(2)
const uploadAll = args.includes('--upload-all-recordings')
const testFile = args.find((a) => !a.startsWith('--'))

if (!testFile) {
  console.error('Usage: npm run test [-- --upload-all-recordings] tests/<file>.spec.ts')
  process.exit(2)
}

mkdirSync('logs', { recursive: true })
let n = 1
while (existsSync(`logs/test-run-${n}.log`)) n++
const LOG = `logs/test-run-${n}.log`
writeFileSync(LOG, `test run ${new Date().toISOString()} — ${testFile}\n`)
const log = (s: string) => appendFileSync(LOG, s.endsWith('\n') ? s : s + '\n')

function execSecrets(secrets: string[], verb: string, verbArgs: string[] = []): string {
  return execFileSync('exec-secrets', [...secrets, '--', verb, ...verbArgs], {
    encoding: 'utf-8',
    timeout: 180_000,
    env: { ...process.env, LC_ALL: 'C' },
  })
}

function sleep(ms: number): void {
  execSync(`sleep ${Math.ceil(ms / 1000)}`)
}

const REQUIRED_SECRETS = ['NEON_API_KEY', 'RECORD_REPLAY_API_KEY', 'NEON_PROJECT_ID', 'DATABASE_URL']

/**
 * Verify every required secret is provisioned before doing any work. Secrets are
 * not in this process's env (they're injected per-verb via exec-secrets), so we
 * read the names from `list-secrets` rather than `process.env`.
 */
function validateSecrets(): void {
  let available: Set<string>
  try {
    const out = execFileSync('list-secrets', [], { encoding: 'utf-8' })
    available = new Set(
      out
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => /^[A-Z0-9_]+$/.test(l)),
    )
  } catch (e) {
    console.error(`could not list secrets: ${String(e)}`)
    process.exit(1)
  }
  const missing = REQUIRED_SECRETS.filter((s) => !available.has(s))
  if (missing.length) {
    console.error(`missing required secrets: ${missing.join(', ')}`)
    process.exit(1)
  }
}

async function main(): Promise<number> {
  // 1. Validate that all required secrets are provisioned.
  validateSecrets()

  // 2. Kill stale dev servers / browsers from previous runs.
  try {
    execSync('kill-stale', { stdio: 'ignore' })
  } catch {
    // best-effort
  }

  // 3. Clean up leftover ephemeral test branches.
  try {
    const listed = JSON.parse(execSecrets(['NEON_API_KEY', 'NEON_PROJECT_ID'], 'neon-list-branches'))
    for (const b of listed.branches ?? []) {
      if (typeof b.name === 'string' && b.name.startsWith('test-run-')) {
        try {
          execSecrets(['NEON_API_KEY', 'NEON_PROJECT_ID'], 'neon-delete-branch', [b.id])
          log(`deleted stale branch ${b.name}`)
        } catch (e) {
          log(`could not delete stale branch ${b.name}: ${String(e)}`)
        }
      }
    }
  } catch (e) {
    log(`branch cleanup skipped: ${String(e)}`)
  }

  // 4. Create a fresh ephemeral branch for this run.
  const branchName = `test-run-${n}-${process.pid}`
  const created = JSON.parse(
    execSecrets(['NEON_API_KEY', 'NEON_PROJECT_ID'], 'neon-create-branch', [branchName]),
  )
  const branchId: string = created.branch.id
  log(`created branch ${branchName} (${branchId})`)

  // 5. Fetch the branch connection URI (kept in-process; never logged).
  const connResp = JSON.parse(
    execSecrets(['NEON_API_KEY', 'NEON_PROJECT_ID'], 'neon-branch-connection-uri', [branchId]),
  )
  const branchUrl: string = connResp.uri
  if (!branchUrl) throw new Error('failed to obtain ephemeral branch connection URI')

  // Neon endpoints need a few seconds to become reachable after branch creation.
  sleep(10_000)

  let exitCode = 1
  try {
    // 6. Initialize schema + seed the ephemeral branch.
    await initSchema(branchUrl)
    await truncateAndSeed(branchUrl)
    log('schema initialized and seeded')

    // 7. Clear stale local recordings.
    try {
      execSync('npx replayio remove --all', { stdio: 'ignore' })
    } catch {
      // ignore
    }

    // 8. Run Playwright. DATABASE_URL is read by playwright.config webServer.env
    //    and by tests/test-helpers.ts. Tests and the dev server share the branch.
    const env = { ...process.env, DATABASE_URL: branchUrl, LC_ALL: 'C' }
    try {
      const out = execSync(
        `npx playwright test ${JSON.stringify(testFile)} --retries 0 --workers 1`,
        { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe'], env, timeout: 300_000 },
      )
      log(out)
      exitCode = 0
    } catch (err: unknown) {
      const e = err as { stdout?: string; stderr?: string; status?: number }
      log((e.stdout ?? '') + (e.stderr ?? ''))
      exitCode = e.status ?? 1
    }

    // 9. Upload Replay recordings (one for failures, or all when requested).
    uploadRecordings(exitCode !== 0)
  } finally {
    // 10. Cleanup: delete the ephemeral branch and clear local recordings.
    try {
      execSecrets(['NEON_API_KEY', 'NEON_PROJECT_ID'], 'neon-delete-branch', [branchId])
      log(`deleted branch ${branchName}`)
    } catch (e) {
      log(`could not delete branch ${branchName}: ${String(e)}`)
    }
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
    log(`replay upload failed: ${String(e)}`)
  }
}

function printSummary(exitCode: number): void {
  const counts = parseResults()
  if (counts) {
    const parts = [`${counts.passed} passed`]
    if (counts.failed) parts.push(`${counts.failed} failed`)
    if (counts.skipped) parts.push(`${counts.skipped} skipped`)
    console.log(`${parts.join(', ')} — see ${LOG}`)
  } else {
    console.log(
      `${exitCode === 0 ? 'tests passed' : 'tests failed'} (no parseable results) — see ${LOG}`,
    )
  }
}

main()
  .then((code) => process.exit(code))
  .catch((err) => {
    log(`harness error: ${err?.stack ?? String(err)}`)
    console.error(`test harness error — see ${LOG}`)
    process.exit(1)
  })
