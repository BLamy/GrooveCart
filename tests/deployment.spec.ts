import { test, expect } from '@playwright/test'

/**
 * GrooveCart production deployment smoke test.
 *
 * Runs against the LIVE deployed URL (see playwright.deployment.config.ts, which
 * reads it from deployment.txt). It is excluded from the integration suite via
 * `testIgnore` in playwright.config.ts.
 *
 * Verifies the two things a deployment must prove:
 *   1. Data displays  — the storefront loads real records from the production DB.
 *   2. Data can be updated and persists — adding a record to the cart writes
 *      session state that survives a full page reload and renders on /cart.
 *
 * The cart is the production-testable write surface: checkout creates orders via
 * the Stripe emulator, which only runs in the integration harness, so the live
 * smoke test exercises the cart write instead of a real purchase.
 */
test('production storefront displays records and persists a cart write', async ({ page }) => {
  // 1. DATA DISPLAYS — load the storefront and confirm DB-backed records render.
  await page.goto('/')

  const addButtons = page.getByRole('button', { name: /Add .* to cart/i })
  await expect(addButtons.first()).toBeVisible({ timeout: 30_000 })
  expect(await addButtons.count()).toBeGreaterThan(0)

  // A specific seeded record proves the live database, not a static fallback.
  await expect(page.getByText('To Pimp a Butterfly').first()).toBeVisible()

  // 2. WRITE — add the first in-stock record to the cart.
  await addButtons.first().click()

  const badge = page.getByTestId('cart-count')
  await expect(badge).toBeVisible()
  await expect(badge).toHaveText('1')

  // 3. PERSISTS — a full reload must preserve the cart write.
  await page.reload()
  await expect(page.getByTestId('cart-count')).toHaveText('1')

  // 4. The /cart page reflects the write, joined against live catalog data.
  await page.goto('/cart')
  const lineItems = page.getByTestId('cart-line-item')
  await expect(lineItems.first()).toBeVisible()
  await expect(lineItems).toHaveCount(1)
  await expect(page.getByTestId('summary-total')).toBeVisible()
})
