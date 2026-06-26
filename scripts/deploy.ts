import { execFileSync, execSync } from 'node:child_process'
import {
  mkdirSync,
  writeFileSync,
  appendFileSync,
  existsSync,
  readFileSync,
} from 'node:fs'
import { schemaStatements, migrationStatements } from './schema'
import { seedStatements } from './seed-db'
import { recorderSchemaStatements } from './recorderSchema'

/**
 * Production deploy for GrooveCart.
 *
 * Syncs the schema (every run), seeds on first deploy only, builds with Vite,
 * deploys to Netlify, and pushes required env vars from .env.example.
 *
 * No secrets are in this process's env — every secret-using operation shells out
 * via `exec-secrets <SECRET…> -- <verb>` from the allowlist. Run via `npm run deploy`.
 */

const appDir = process.cwd()
mkdirSync('logs', { recursive: true })
const LOG = 'logs/deploy.log'
writeFileSync(LOG, `deploy run ${new Date().toISOString()}\n`)
const log = (s: string) => appendFileSync(LOG, s.endsWith('\n') ? s : s + '\n')

function execSecrets(secrets: string[], verb: string, verbArgs: string[] = []): string {
  return execFileSync('exec-secrets', [...secrets, '--', verb, ...verbArgs], {
    encoding: 'utf-8',
    cwd: appDir,
    timeout: 300_000,
    env: { ...process.env, LC_ALL: 'C' },
  })
}

function availableSecrets(): Set<string> {
  try {
    const out = execSync('list-secrets', { encoding: 'utf-8' })
    const names = new Set<string>()
    let inSecrets = false
    for (const line of out.split('\n')) {
      if (/^Secrets:/.test(line)) {
        inSecrets = true
        continue
      }
      if (/^Allowlist/.test(line)) break
      if (inSecrets) {
        const m = line.trim().match(/^([A-Z0-9_]+)$/)
        if (m && m[1]) names.add(m[1])
      }
    }
    return names
  } catch {
    return new Set<string>()
  }
}

function envExampleKeys(): string[] {
  if (!existsSync('.env.example')) return []
  return readFileSync('.env.example', 'utf-8')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'))
    .map((l) => (l.split('=')[0] ?? '').trim())
    .filter(Boolean)
}

/** Strip any embedded credentials from a git remote URL. */
function sanitizeRepoUrl(url: string): string {
  // https://user:token@host/... -> https://host/...
  return url.replace(/:\/\/[^@/]+@/, '://').trim()
}

async function main(): Promise<number> {
  // 1. Schema sync against the main branch (DATABASE_URL points there). Includes
  //    the Netlify Recorder tables/triggers (backend_requests, audit_log) so the
  //    recorder has its store in production.
  const ddl = [...schemaStatements, ...migrationStatements, ...(await recorderSchemaStatements())]
  execSecrets(['DATABASE_URL'], 'neon-exec-sql-batch', [JSON.stringify(ddl)])
  log('schema synced')

  // 2. Seed on first deploy only (records table empty).
  try {
    const countResp = execSecrets(['DATABASE_URL'], 'neon-exec-sql', [
      'SELECT count(*)::int AS c FROM records',
    ])
    const parsed = JSON.parse(countResp)
    const count = Number(parsed?.rows?.[0]?.c ?? 0)
    if (count === 0) {
      execSecrets(['DATABASE_URL'], 'neon-exec-sql-batch', [JSON.stringify(seedStatements())])
      log('database seeded (first deploy)')
    } else {
      log(`seed skipped (records already present: ${count})`)
    }
  } catch (e) {
    log(`seed check failed: ${String(e)}`)
  }

  // 3. Build.
  try {
    const out = execSync('npx vite build', {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'pipe'],
      cwd: appDir,
    })
    log(out)
  } catch (err: unknown) {
    const e = err as { stdout?: string; stderr?: string }
    log((e.stdout ?? '') + (e.stderr ?? ''))
    console.log('Deploy failed (build) — see logs/deploy.log')
    return 1
  }
  // Ensure the SPA catch-all redirect exists in the build output.
  if (!existsSync('dist/_redirects')) {
    writeFileSync('dist/_redirects', '/* /index.html 200\n')
  }

  // 4. Commit pending changes BEFORE reading COMMIT_SHA. `netlify deploy` ships
  //    the working tree, but the Netlify Recorder service checks out COMMIT_SHA
  //    to replay backend requests — it must point at a real commit whose code
  //    matches what we deploy, or recordings replay the wrong code.
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf-8', cwd: appDir }).trim()
    if (status) {
      execSync('git add -A', { encoding: 'utf-8', cwd: appDir })
      execSync('git commit -m "pre-deploy snapshot"', { encoding: 'utf-8', cwd: appDir })
      log('committed pre-deploy snapshot')
    } else {
      log('no pending changes to commit')
    }
  } catch (e) {
    log(`pre-deploy commit failed: ${String(e)}`)
  }

  const commitSha = execSync('git rev-parse HEAD', { encoding: 'utf-8', cwd: appDir }).trim()
  const branchName = execSync('git rev-parse --abbrev-ref HEAD', {
    encoding: 'utf-8',
    cwd: appDir,
  }).trim()
  const repositoryUrl = sanitizeRepoUrl(
    execSync('git remote get-url origin', { encoding: 'utf-8', cwd: appDir }),
  )

  // 5. Set env vars on Netlify BEFORE deploying — Netlify snapshots env at deploy
  //    time, so functions would otherwise see stale values. Order matters for the
  //    recorder: COMMIT_SHA / BRANCH_NAME / REPLAY_REPOSITORY_URL must match the
  //    commit we ship (see step 4); UPLOADTHING_TOKEN lets the wrapper upload
  //    captured blobs.
  const secrets = availableSecrets()
  const netlifyBase = ['NETLIFY_AUTH_TOKEN', 'NETLIFY_ACCOUNT_SLUG', 'NETLIFY_SITE_ID']

  const literalEnv: Array<[string, string]> = [
    ['COMMIT_SHA', commitSha],
    ['BRANCH_NAME', branchName],
    ['REPLAY_REPOSITORY_URL', repositoryUrl],
  ]
  for (const [key, value] of literalEnv) {
    try {
      execSecrets(netlifyBase, 'netlify-env-set', [key, value, 'production'])
      log(`set env ${key}`)
    } catch (e) {
      log(`failed to set env ${key}: ${String(e)}`)
    }
  }

  // Secret-valued env: the recorder's UPLOADTHING_TOKEN plus anything declared in
  // .env.example. Unset-then-set so stale values never linger.
  const secretEnvKeys = ['UPLOADTHING_TOKEN', ...envExampleKeys()]
  const seenSecretKeys = new Set<string>()
  for (const key of secretEnvKeys) {
    if (seenSecretKeys.has(key)) continue
    seenSecretKeys.add(key)
    try {
      execSecrets(netlifyBase, 'netlify-env-unset', [key])
    } catch {
      // ignore if missing
    }
    if (secrets.has(key)) {
      try {
        execSecrets([...netlifyBase, key], 'netlify-env-set-from-secret', [key, 'production'])
        log(`set env ${key} (from secret)`)
      } catch (e) {
        log(`failed to set env ${key}: ${String(e)}`)
      }
    } else {
      log(`skipped env ${key} (not an available secret)`)
    }
  }

  // 6. Deploy to Netlify (after schema, build, commit, and env are all in place).
  let url = ''
  try {
    const out = execSecrets(['NETLIFY_AUTH_TOKEN', 'NETLIFY_SITE_ID'], 'netlify-deploy-prod')
    log(out)
    // Netlify prints `Production URL: <https://…>` and `Unique deploy URL: <…>`.
    // Prefer the stable production URL; strip the wrapping angle brackets.
    const prod = out.match(/Production URL:\s*<?(https?:\/\/[^\s>]+)/i)
    if (prod) {
      url = prod[1] ?? ''
    } else {
      const m = out.match(/https?:\/\/[^\s>]+\.netlify\.app/g)
      if (m && m.length) url = m[m.length - 1] ?? ''
    }
  } catch (err: unknown) {
    const e = err as { stdout?: string; stderr?: string }
    log((e.stdout ?? '') + (e.stderr ?? ''))
    console.log('Deploy failed (netlify) — see logs/deploy.log')
    return 1
  }

  // 7. Record deployment — overwrite the leading resource block, preserve history below.
  const stamp = new Date().toISOString()
  let history = ''
  if (existsSync('deployment.txt')) {
    const lines = readFileSync('deployment.txt', 'utf-8').split('\n')
    let i = 0
    while (i < lines.length && /^(url|deployed_at)\b/.test(lines[i] ?? '')) i++
    history = lines.slice(i).join('\n').replace(/^\n+/, '').trimEnd()
  }
  const block = `url ${url}\ndeployed_at ${stamp}\n`
  writeFileSync('deployment.txt', history ? `${block}\n${history}\n` : block)
  console.log(url ? `Deployed to ${url}` : 'Deployed (url not parsed) — see logs/deploy.log')
  return 0
}

main()
  .then((code) => process.exit(code))
  .catch((err) => {
    log(`deploy harness error: ${String(err?.stack ?? err)}`)
    console.log('Deploy failed — see logs/deploy.log')
    process.exit(1)
  })
