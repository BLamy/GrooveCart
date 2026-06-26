import { neon } from '@neondatabase/serverless'

/**
 * Shared database helper for Netlify Functions.
 *
 * Returns a Neon serverless SQL tagged-template client bound to `DATABASE_URL`.
 * The client is cached per warm Lambda so we don't reconstruct it on every call.
 *
 * Usage:
 *   const sql = getSql()
 *   const rows = await sql`SELECT * FROM records WHERE id = ${id}`
 */
type Sql = ReturnType<typeof neon>

let cached: Sql | null = null

export function getSql(): Sql {
  if (cached) return cached
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL is not set')
  }
  cached = neon(url)
  return cached
}
