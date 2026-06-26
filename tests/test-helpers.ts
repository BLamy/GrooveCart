import { truncateAndSeed as rawTruncateAndSeed } from '../scripts/seed-db'

/**
 * Shared test helpers.
 *
 * The test harness (scripts/test.ts) creates an ephemeral Neon branch and sets
 * `DATABASE_URL` to its connection string before launching Playwright, so test
 * worker processes can read it here.
 */
export const branchDbUrl: string = process.env.DATABASE_URL ?? ''

/**
 * Truncate + re-seed the ephemeral branch with brief retry/backoff to absorb
 * transient Neon connectivity errors. Call once per spec file in `beforeAll`,
 * NOT in `beforeEach` (see skills/tasks/build/testing.md).
 */
export async function truncateAndSeed(databaseUrl: string = branchDbUrl): Promise<void> {
  if (!databaseUrl) throw new Error('DATABASE_URL not set for tests')
  const delays = [0, 2000, 4000, 8000]
  let lastErr: unknown
  for (const delay of delays) {
    if (delay) await new Promise((r) => setTimeout(r, delay))
    try {
      await rawTruncateAndSeed(databaseUrl)
      return
    } catch (err) {
      lastErr = err
    }
  }
  throw lastErr
}
