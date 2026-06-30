import { buildAuthState, getAuthProvider } from './auth-providers'

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function providerFromPath(req: Request): string | null {
  const segments = new URL(req.url).pathname.split('/').filter(Boolean)
  const idx = segments.lastIndexOf('login')
  return idx === -1 ? null : segments[idx + 1] ?? null
}

function resolveOrigin(req: Request): string {
  const fromHeader = req.headers.get('origin')
  if (fromHeader) return fromHeader.replace(/\/$/, '')
  if (process.env.PUBLIC_BASE_URL) return process.env.PUBLIC_BASE_URL.replace(/\/$/, '')
  return new URL(req.url).origin
}

async function handler(req: Request): Promise<Response> {
  if (req.method !== 'GET') {
    return json({ error: 'Method not allowed' }, 405)
  }

  const providerId = providerFromPath(req)
  const provider = getAuthProvider(providerId)
  if (!provider || !providerId) {
    return json({ error: 'Unknown auth provider' }, 404)
  }

  const origin = resolveOrigin(req)
  const redirectUri = `${origin}/api/auth/callback/${provider.callbackSlug}`
  const authorizeUrl = new URL(provider.buildAuthorizationUrl())
  authorizeUrl.searchParams.set('response_type', 'code')
  authorizeUrl.searchParams.set('client_id', process.env[provider.clientIdEnv] || provider.defaultClientId)
  authorizeUrl.searchParams.set('redirect_uri', redirectUri)
  authorizeUrl.searchParams.set('scope', provider.scope)
  authorizeUrl.searchParams.set('state', buildAuthState(providerId))
  authorizeUrl.searchParams.set('nonce', buildAuthState('nonce'))

  return Response.redirect(authorizeUrl, 302)
}

export default handler
