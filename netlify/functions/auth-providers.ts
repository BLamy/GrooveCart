import { randomUUID } from 'node:crypto'

interface AuthProviderConfig {
  label: string
  callbackSlug: string
  clientIdEnv: string
  clientSecretEnv?: string
  defaultClientId: string
  defaultClientSecret?: string
  scope: string
  buildAuthorizationUrl(): string
}

const trimRight = (value: string): string => value.replace(/\/+$/, '')

const emulatorBase = (envName: string, fallback: string): string =>
  trimRight(process.env[envName] || fallback)

const oktaIssuer = (): string =>
  trimRight(
    process.env.OKTA_ISSUER ||
      process.env.AUTH0_ISSUER_BASE_URL ||
      `${emulatorBase('OKTA_EMULATOR_URL', 'http://127.0.0.1:4006')}/oauth2/default`,
  )

export const AUTH_PROVIDER_CONFIGS = {
  google: {
    label: 'Google',
    callbackSlug: 'google',
    clientIdEnv: 'GOOGLE_CLIENT_ID',
    clientSecretEnv: 'GOOGLE_CLIENT_SECRET',
    defaultClientId: 'groovecart-google-client.apps.googleusercontent.com',
    defaultClientSecret: 'groovecart-google-secret',
    scope: 'openid email profile',
    buildAuthorizationUrl: () =>
      `${emulatorBase('GOOGLE_EMULATOR_URL', 'http://127.0.0.1:4002')}/o/oauth2/v2/auth`,
  },
  apple: {
    label: 'Apple',
    callbackSlug: 'apple',
    clientIdEnv: 'APPLE_CLIENT_ID',
    defaultClientId: 'com.groovecart.web',
    scope: 'openid email name',
    buildAuthorizationUrl: () =>
      `${emulatorBase('APPLE_EMULATOR_URL', 'http://127.0.0.1:4004')}/auth/authorize`,
  },
  microsoft: {
    label: 'Microsoft Entra ID',
    callbackSlug: 'microsoft',
    clientIdEnv: 'MICROSOFT_CLIENT_ID',
    clientSecretEnv: 'MICROSOFT_CLIENT_SECRET',
    defaultClientId: 'groovecart-microsoft-client',
    defaultClientSecret: 'groovecart-microsoft-secret',
    scope: 'openid email profile User.Read',
    buildAuthorizationUrl: () =>
      `${emulatorBase('MICROSOFT_EMULATOR_URL', 'http://127.0.0.1:4005')}/oauth2/v2.0/authorize`,
  },
  clerk: {
    label: 'Clerk',
    callbackSlug: 'clerk',
    clientIdEnv: 'CLERK_CLIENT_ID',
    clientSecretEnv: 'CLERK_CLIENT_SECRET',
    defaultClientId: 'groovecart-clerk-client',
    defaultClientSecret: 'groovecart-clerk-secret',
    scope: 'openid profile email',
    buildAuthorizationUrl: () =>
      `${emulatorBase('CLERK_EMULATOR_URL', 'http://127.0.0.1:4011')}/oauth/authorize`,
  },
  okta: {
    label: 'Okta / Auth0',
    callbackSlug: 'okta',
    clientIdEnv: 'OKTA_CLIENT_ID',
    clientSecretEnv: 'OKTA_CLIENT_SECRET',
    defaultClientId: 'groovecart-okta-client',
    defaultClientSecret: 'groovecart-okta-secret',
    scope: 'openid profile email groups',
    buildAuthorizationUrl: () => `${oktaIssuer()}/v1/authorize`,
  },
} satisfies Record<string, AuthProviderConfig>

export type AuthProviderId = keyof typeof AUTH_PROVIDER_CONFIGS

export function getAuthProvider(id: string | null): AuthProviderConfig | null {
  if (!id) return null
  return AUTH_PROVIDER_CONFIGS[id as AuthProviderId] ?? null
}

export function buildAuthState(providerId: string): string {
  return `${providerId}-${randomUUID()}`
}
