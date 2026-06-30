export const AUTH_PROVIDERS = [
  {
    id: 'microsoft',
    label: 'Microsoft Entra ID',
    loginPath: '/api/auth/login/microsoft',
  },
  {
    id: 'apple',
    label: 'Sign in with Apple',
    loginPath: '/api/auth/login/apple',
  },
  {
    id: 'google',
    label: 'Login with Google',
    loginPath: '/api/auth/login/google',
  },
  {
    id: 'clerk',
    label: 'Clerk',
    loginPath: '/api/auth/login/clerk',
  },
  {
    id: 'okta',
    label: 'Okta / Auth0',
    loginPath: '/api/auth/login/okta',
  },
] as const

export type AuthProviderId = typeof AUTH_PROVIDERS[number]['id']
