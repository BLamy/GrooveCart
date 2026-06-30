import { defineConfig } from '@playwright/test'
import { devices as replayDevices } from '@replayio/playwright'

/**
 * Playwright config for GrooveCart.
 *
 * Tests run against a Vite-backed e2e server that mounts the same function
 * handlers used by Netlify Functions. Checkout tests expect `scripts/test.ts`
 * to start the Stripe/Resend emulators and pass their local API bases.
 * The `scripts/test.ts` harness invokes Playwright with `--retries 0 --workers 1`.
 */
const PORT = Number(process.env.E2E_PORT ?? 8888)
const BASE_URL = `http://localhost:${PORT}`
const OKTA_EMULATOR_URL = process.env.OKTA_EMULATOR_URL ?? 'http://127.0.0.1:4006'

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
    reuseExistingServer: process.env.E2E_REUSE_EXISTING_SERVER === '1',
    timeout: 120_000,
    env: {
      PORT: String(PORT),
      PUBLIC_BASE_URL: BASE_URL,
      STRIPE_API_BASE: process.env.STRIPE_API_BASE ?? 'http://127.0.0.1:4009',
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ?? 'sk_test_emulated',
      RESEND_API_BASE: process.env.RESEND_API_BASE ?? 'http://127.0.0.1:4008',
      RESEND_EMULATOR_URL: process.env.RESEND_EMULATOR_URL ?? process.env.RESEND_API_BASE ?? 'http://127.0.0.1:4008',
      RESEND_API_KEY: process.env.RESEND_API_KEY ?? 're_test_emulated',
      EMAIL_FROM: process.env.EMAIL_FROM ?? 'GrooveCart <orders@groovecart.test>',
      GOOGLE_EMULATOR_URL: process.env.GOOGLE_EMULATOR_URL ?? 'http://127.0.0.1:4002',
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ?? 'groovecart-google-client.apps.googleusercontent.com',
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ?? 'groovecart-google-secret',
      APPLE_EMULATOR_URL: process.env.APPLE_EMULATOR_URL ?? 'http://127.0.0.1:4004',
      APPLE_CLIENT_ID: process.env.APPLE_CLIENT_ID ?? 'com.groovecart.web',
      MICROSOFT_EMULATOR_URL: process.env.MICROSOFT_EMULATOR_URL ?? 'http://127.0.0.1:4005',
      MICROSOFT_CLIENT_ID: process.env.MICROSOFT_CLIENT_ID ?? 'groovecart-microsoft-client',
      MICROSOFT_CLIENT_SECRET: process.env.MICROSOFT_CLIENT_SECRET ?? 'groovecart-microsoft-secret',
      OKTA_EMULATOR_URL,
      OKTA_ISSUER: process.env.OKTA_ISSUER ?? `${OKTA_EMULATOR_URL}/oauth2/default`,
      OKTA_CLIENT_ID: process.env.OKTA_CLIENT_ID ?? 'groovecart-okta-client',
      OKTA_CLIENT_SECRET: process.env.OKTA_CLIENT_SECRET ?? 'groovecart-okta-secret',
      AUTH0_ISSUER_BASE_URL: process.env.AUTH0_ISSUER_BASE_URL ?? `${OKTA_EMULATOR_URL}/oauth2/default`,
      AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID ?? 'groovecart-okta-client',
      AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET ?? 'groovecart-okta-secret',
      CLERK_EMULATOR_URL: process.env.CLERK_EMULATOR_URL ?? 'http://127.0.0.1:4011',
      CLERK_CLIENT_ID: process.env.CLERK_CLIENT_ID ?? 'groovecart-clerk-client',
      CLERK_CLIENT_SECRET: process.env.CLERK_CLIENT_SECRET ?? 'groovecart-clerk-secret',
    },
  },
})
