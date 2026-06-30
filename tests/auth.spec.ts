import { expect, test } from '@playwright/test'

const providers = [
  {
    id: 'microsoft',
    label: 'Microsoft Entra ID',
    url: /127\.0\.0\.1:4005\/oauth2\/v2\.0\/authorize/,
    pageText: 'Sign in with Microsoft',
  },
  {
    id: 'apple',
    label: 'Sign in with Apple',
    url: /127\.0\.0\.1:4004\/auth\/authorize/,
    pageText: 'Sign in with Apple',
  },
  {
    id: 'google',
    label: 'Login with Google',
    url: /127\.0\.0\.1:4002\/o\/oauth2\/v2\/auth/,
    pageText: 'Sign in to Google',
  },
  {
    id: 'clerk',
    label: 'Clerk',
    url: /127\.0\.0\.1:4011\/oauth\/authorize/,
    pageText: 'Sign in with Clerk',
  },
  {
    id: 'okta',
    label: 'Okta / Auth0',
    url: /127\.0\.0\.1:4006\/oauth2\/default\/v1\/authorize/,
    pageText: 'Sign in with Okta',
  },
] as const

test.describe('login provider buttons', () => {
  for (const provider of providers) {
    test(`${provider.label} opens its emulated auth page`, async ({ page }) => {
      await page.goto('/login')

      await Promise.all([
        page.waitForURL(provider.url),
        page.getByTestId(`auth-provider-${provider.id}`).click(),
      ])

      await expect(page.locator('body')).toContainText(provider.pageText)
    })
  }
})
