import { getAuthProvider } from './auth-providers'

function providerFromPath(req: Request): string | null {
  const segments = new URL(req.url).pathname.split('/').filter(Boolean)
  const idx = segments.lastIndexOf('callback')
  return idx === -1 ? null : segments[idx + 1] ?? null
}

async function handler(req: Request): Promise<Response> {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 })
  }

  const providerId = providerFromPath(req)
  const provider = getAuthProvider(providerId)
  if (!provider) {
    return Response.json({ error: 'Unknown auth provider' }, { status: 404 })
  }

  const url = new URL(req.url)
  const code = url.searchParams.get('code') ?? ''
  const body = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Signed in to GrooveCart</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font-family: Inter, system-ui, -apple-system, Segoe UI, sans-serif; margin: 0; background: #faf7f2; color: #1c1917; }
      main { min-height: 100vh; display: grid; place-items: center; padding: 24px; }
      section { max-width: 440px; background: #fff; border: 1px solid #e7e1d8; border-radius: 14px; padding: 28px; box-shadow: 0 1px 2px rgba(28,25,23,.04), 0 6px 20px rgba(28,25,23,.06); }
      h1 { margin: 0 0 8px; font-size: 24px; }
      p { margin: 0; color: #6b6660; }
      a { display: inline-block; margin-top: 20px; color: #c2410c; font-weight: 700; text-decoration: none; }
    </style>
  </head>
  <body>
    <main>
      <section>
        <h1>Signed in with ${provider.label}</h1>
        <p>${code ? 'The emulated authorization callback completed.' : 'The emulated provider returned without an authorization code.'}</p>
        <a href="/">Return to catalog</a>
      </section>
    </main>
  </body>
</html>`

  return new Response(body, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}

export default handler
