import { execSync } from 'node:child_process'
import { mkdirSync, writeFileSync, appendFileSync } from 'node:fs'

/**
 * Quality gate: typecheck (tsc --noEmit) then lint with autofix (eslint --fix).
 * Full output is written to logs/check.log; stdout gets a one-line summary.
 */
mkdirSync('logs', { recursive: true })
const LOG = 'logs/check.log'
writeFileSync(LOG, `check run ${new Date().toISOString()}\n`)

function run(label: string, cmd: string): boolean {
  appendFileSync(LOG, `\n=== ${label}: ${cmd} ===\n`)
  try {
    const out = execSync(cmd, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe'] })
    appendFileSync(LOG, out)
    return true
  } catch (err: unknown) {
    const e = err as { stdout?: string; stderr?: string; message?: string }
    appendFileSync(LOG, (e.stdout ?? '') + (e.stderr ?? '') + (e.message ?? ''))
    return false
  }
}

const typesOk = run('typecheck', 'npx tsc --noEmit')
const lintOk = run('lint', 'npx eslint . --fix')

if (typesOk && lintOk) {
  console.log('check passed')
  process.exit(0)
} else {
  const failed = [!typesOk && 'typecheck', !lintOk && 'lint'].filter(Boolean).join('|')
  console.log(`check failed (${failed}) — see logs/check.log`)
  process.exit(1)
}
