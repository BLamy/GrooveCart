import { getSql } from './db'
import { withRecording } from './recording'

/**
 * Records API.
 *
 *   GET /api/records       — the full record catalog (newest first).
 *   GET /api/records/:id    — a single record by id (404 if absent).
 *
 * Maps the snake_case, integer-cents database rows to the camelCase, dollars
 * JSON shape the storefront consumes (`RecordItem`). The list is returned newest
 * first (release year descending) so the default Storefront ordering matches
 * without extra client work, though the client re-sorts as the shopper chooses.
 */

interface RecordRow {
  id: number
  title: string
  artist: string
  genre: string
  release_year: number
  price_cents: number
  cover_image: string
  description: string
  stock: number
}

function toRecordItem(r: RecordRow) {
  return {
    id: r.id,
    title: r.title,
    artist: r.artist,
    genre: r.genre,
    releaseYear: r.release_year,
    price: r.price_cents / 100,
    coverImage: r.cover_image,
    description: r.description,
    stock: r.stock,
  }
}

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

  const sql = getSql()
  const id = parseRecordId(req)

  try {
    if (id !== null) {
      const rows = (await sql`
        SELECT id, title, artist, genre, release_year, price_cents, cover_image, description, stock
        FROM records
        WHERE id = ${id}
      `) as RecordRow[]

      const record = rows[0]
      if (!record) {
        return json({ error: 'Record not found' }, 404)
      }
      return json(toRecordItem(record))
    }

    const rows = (await sql`
      SELECT id, title, artist, genre, release_year, price_cents, cover_image, description, stock
      FROM records
      ORDER BY release_year DESC, id DESC
    `) as RecordRow[]

    return json(rows.map(toRecordItem))
  } catch (err) {
    console.error('GET /api/records failed', err)
    return json({ error: 'Failed to load records' }, 500)
  }
}

export default withRecording('netlify/functions/records', handler)
