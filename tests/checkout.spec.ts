import { test, expect } from '@playwright/test'

test('checkout completes through the emulated Stripe hosted page', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()

  await page.getByRole('button', { name: /Add To Pimp a Butterfly to cart/i }).click()
  await expect(page.getByTestId('cart-count')).toHaveText('1')

  await page.goto('/cart')
  await expect(page.getByTestId('cart-line-item')).toContainText('To Pimp a Butterfly')
  await expect(page.getByTestId('summary-total')).toHaveText('$32.99')
  await page.getByTestId('checkout-button').click()

  await expect(page).toHaveURL(/localhost:4009\/checkout\/cs_/)
  await expect(page.getByText('To Pimp a Butterfly - Kendrick Lamar')).toBeVisible()
  await expect(page.getByText('$32.99').first()).toBeVisible()

  await page.getByPlaceholder('you@example.com').fill('listener@example.com')
  await page.getByRole('button', { name: /Pay \$32\.99/i }).click()

  await expect(page).toHaveURL(/\/order\/confirmation\?session_id=cs_/)
  await expect(page.getByTestId('order-confirmation-page')).toBeVisible()
  await expect(page.getByTestId('order-reference')).toContainText(/^GC-/)
  await expect(page.getByTestId('order-line-item')).toContainText('To Pimp a Butterfly')
  await expect(page.getByTestId('order-line-item')).toContainText('Kendrick Lamar')
  await expect(page.getByTestId('order-total')).toHaveText('$32.99')
  await expect(page.getByTestId('cart-count')).toBeHidden()
})
