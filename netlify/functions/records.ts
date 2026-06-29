import { findCatalogRecord, getCatalogRecords } from './catalog'

/**
 * Records API.
 *
 *   GET /api/records       — the full record catalog (newest first).
 *   GET /api/records/:id    — a single record by id (404 if absent).
 *
 * Kept as an API compatibility shim over the static JSON catalog. The
 * storefront fetches `/data/records.json` directly, so catalog browsing has no
 * function or database dependency.
 */
function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

/**
 * Extract a trailing record id from the request path. The Netlify redirect maps
 * `/api/records/:id` to `/.netlify/functions/records/:id`, so the id (when
 * present) is the segment after `records`.
 */
function parseRecordId(req: Request): number | null {
  const segments = new URL(req.url).pathname.split('/').filter(Boolean)
  const idx = segments.lastIndexOf('records')
  if (idx === -1 || idx === segments.length - 1) return null
  const raw = segments[idx + 1]
  const id = Number(raw)
  return Number.isInteger(id) && id > 0 ? id : null
}

async function handler(req: Request): Promise<Response> {
  if (req.method !== 'GET') {
    return json({ error: 'Method not allowed' }, 405)
  }

  const id = parseRecordId(req)

  if (id !== null) {
    const record = findCatalogRecord(id)
    if (!record) {
      return json({ error: 'Record not found' }, 404)
    }
    return json(record)
  }

  return json(getCatalogRecords())
}

export default handler
