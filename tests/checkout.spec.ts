import { test, expect } from '@playwright/test'

const RESEND_API_BASE = process.env.RESEND_API_BASE ?? 'http://127.0.0.1:4008'

interface CapturedEmail {
  to: string[]
  subject: string
  text: string | null
  html: string | null
}

async function findConfirmationEmail(orderReference: string): Promise<CapturedEmail | null> {
  const res = await fetch(`${RESEND_API_BASE}/emails`)
  if (!res.ok) return null
  const data = await res.json() as { data?: CapturedEmail[] }
  return data.data?.find((email) =>
    email.to.includes('listener@example.com') &&
    email.subject.includes(orderReference)
  ) ?? null
}

async function waitForConfirmationEmail(orderReference: string): Promise<CapturedEmail> {
  const started = Date.now()
  while (Date.now() - started < 10_000) {
    const email = await findConfirmationEmail(orderReference)
    if (email) return email
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  throw new Error(`Timed out waiting for confirmation email for ${orderReference}`)
}

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

  const orderReference = await page.getByTestId('order-reference').innerText()
  const confirmationEmail = await waitForConfirmationEmail(orderReference)

  expect(confirmationEmail.to).toContain('listener@example.com')
  expect(confirmationEmail.subject).toBe(`GrooveCart order ${orderReference} confirmed`)
  expect(confirmationEmail.text).toContain('To Pimp a Butterfly - Kendrick Lamar')
  expect(confirmationEmail.text).toContain('$32.99')
  expect(confirmationEmail.html).toContain(orderReference)
})
