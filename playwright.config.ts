import { defineConfig } from '@playwright/test'
import { devices as replayDevices } from '@replayio/playwright'

/**
 * Playwright config for GrooveCart.
 *
 * Tests run against `netlify dev` (Vite + Netlify Functions) on port 8888 using
 * the Replay Chromium browser so failures can be debugged via Replay recordings.
 * The `scripts/test.ts` harness owns Neon branch setup/seeding and invokes
 * Playwright with `--retries 0 --workers 1`.
 */
const PORT = 8888
const BASE_URL = `http://localhost:${PORT}`

export default defineConfig({
  testDir: './tests',
  // The production deployment smoke test has its own config
  // (playwright.deployment.config.ts) and must never run in the integration suite.
  testIgnore: ['**/deployment.spec.ts'],
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [
    ['list'],
    ['@replayio/playwright/reporter', { upload: false }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
  ],
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: BASE_URL,
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    trace: 'off',
  },
  projects: [
    {
      name: 'replay-chromium',
      use: { ...replayDevices['Replay Chromium'] },
    },
  ],
  webServer: {
    command: `npx netlify dev --offline --port ${PORT} --targetPort 5173 --functions ./netlify/functions`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      DATABASE_URL: process.env.DATABASE_URL ?? '',
    },
  },
})
