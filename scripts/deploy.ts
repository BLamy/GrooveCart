import { execFileSync, execSync } from 'node:child_process'
import {
  mkdirSync,
  writeFileSync,
  appendFileSync,
  existsSync,
  readFileSync,
} from 'node:fs'

/**
 * Production deploy for GrooveCart.
 *
 * Builds with Vite, deploys to Netlify, and pushes required env vars from
 * `.env.example`. The catalog is served as static JSON, so there is no database
 * schema or seed step.
 *
 * No secrets are in this process's env - every secret-using operation shells out
 * via `exec-secrets <SECRET...> -- <verb>` from the allowlist. Run via
 * `npm run deploy`.
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
        if (m?.[1]) names.add(m[1])
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

async function main(): Promise<number> {
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
    console.log('Deploy failed (build) - see logs/deploy.log')
    return 1
  }

  // Ensure the SPA catch-all redirect exists in the build output.
  if (!existsSync('dist/_redirects')) {
    writeFileSync('dist/_redirects', '/* /index.html 200\n')
  }

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

  const secrets = availableSecrets()
  const netlifyBase = ['NETLIFY_AUTH_TOKEN', 'NETLIFY_ACCOUNT_SLUG', 'NETLIFY_SITE_ID']

  for (const key of envExampleKeys()) {
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

  let url = ''
  try {
    const out = execSecrets(['NETLIFY_AUTH_TOKEN', 'NETLIFY_SITE_ID'], 'netlify-deploy-prod')
    log(out)
    const prod = out.match(/Production URL:\s*<?(https?:\/\/[^\s>]+)/i)
    if (prod) {
      url = prod[1] ?? ''
    } else {
      const m = out.match(/https?:\/\/[^\s>]+\.netlify\.app/g)
      if (m?.length) url = m[m.length - 1] ?? ''
    }
  } catch (err: unknown) {
    const e = err as { stdout?: string; stderr?: string }
    log((e.stdout ?? '') + (e.stderr ?? ''))
    console.log('Deploy failed (netlify) - see logs/deploy.log')
    return 1
  }

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
  console.log(url ? `Deployed to ${url}` : 'Deployed (url not parsed) - see logs/deploy.log')
  return 0
}

main()
  .then((code) => process.exit(code))
  .catch((err) => {
    log(`deploy harness error: ${String(err?.stack ?? err)}`)
    console.log('Deploy failed - see logs/deploy.log')
    process.exit(1)
  })
