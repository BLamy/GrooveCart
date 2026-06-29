import { defineConfig } from '@playwright/test'
import { devices as replayDevices } from '@replayio/playwright'

/**
 * Playwright config for GrooveCart.
 *
 * Tests run against a Vite-backed e2e server that mounts the same function
 * handlers used by Netlify Functions. Checkout tests expect `scripts/test.ts`
 * to start the Stripe emulator and pass `STRIPE_API_BASE`.
 * The `scripts/test.ts` harness invokes Playwright with `--retries 0 --workers 1`.
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
    command: `npx tsx scripts/e2e-server.ts`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      PORT: String(PORT),
      PUBLIC_BASE_URL: BASE_URL,
      STRIPE_API_BASE: process.env.STRIPE_API_BASE ?? 'http://127.0.0.1:4009',
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ?? 'sk_test_emulated',
    },
  },
})
