import { defineConfig } from '@playwright/test'
import { devices as replayDevices } from '@replayio/playwright'

/**
 * Deployment smoke-test config for GrooveCart.
 *
 * Runs the single `tests/deployment.spec.ts` against the LIVE production URL
 * (read from `deployment.txt`) using the Replay Chromium browser so the run can
 * be analyzed via the Replay MCP tools. Unlike `playwright.config.ts` this does
 * NOT start a dev server and does NOT touch Neon — it points at the deployed app.
 *
 * Recordings are written locally (`upload: false`); the deploy/test harness
 * uploads them afterwards with `exec-secrets RECORD_REPLAY_API_KEY -- replay-upload-all`,
 * since arbitrary commands cannot read the API key directly in this container.
 */
import { readFileSync, existsSync } from 'node:fs'

function deployedUrl(): string {
  if (process.env.DEPLOY_URL) return process.env.DEPLOY_URL
  if (existsSync('deployment.txt')) {
    const m = readFileSync('deployment.txt', 'utf-8').match(/^url\s+(\S+)/m)
    if (m && m[1]) return m[1]
  }
  throw new Error('No deployment URL found (set DEPLOY_URL or add a `url` line to deployment.txt)')
}

const BASE_URL = deployedUrl()

export default defineConfig({
  testDir: './tests',
  testMatch: ['**/deployment.spec.ts'],
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [
    ['list'],
    ['@replayio/playwright/reporter', { upload: false }],
    ['json', { outputFile: 'test-results/deployment-results.json' }],
  ],
  timeout: 120_000,
  expect: { timeout: 30_000 },
  use: {
    baseURL: BASE_URL,
    actionTimeout: 30_000,
    navigationTimeout: 60_000,
    trace: 'off',
  },
  projects: [
    {
      name: 'replay-chromium',
      use: { ...replayDevices['Replay Chromium'] },
    },
  ],
})
