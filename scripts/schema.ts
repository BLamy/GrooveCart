import { neon } from '@neondatabase/serverless'
import { runRecorderSchema, type RecorderSql } from './recorderSchema'

/**
 * Single source of truth for the GrooveCart database schema.
 *
 * `schemaStatements` holds the idempotent DDL (all `CREATE TABLE IF NOT EXISTS`
 * / `CREATE INDEX IF NOT EXISTS`). `initSchema(url)` runs them via the Neon
 * serverless driver. The test harness and deploy script reuse `schemaStatements`
 * (and `migrationStatements`) so the schema is defined in exactly one place.
 *
 * Tables:
 *  - records           — the catalog of vinyl records for sale.
 *  - orders            — completed/initiated purchases keyed by Stripe session.
 *  - order_line_items  — the records + quantities belonging to each order, with
 *                        snapshotted title/artist/cover/price so a confirmed
 *                        order renders correctly even if the catalog later changes.
 */
export const schemaStatements: string[] = [
  `CREATE TABLE IF NOT EXISTS records (
    id            SERIAL PRIMARY KEY,
    slug          TEXT NOT NULL UNIQUE,
    title         TEXT NOT NULL,
    artist        TEXT NOT NULL,
    genre         TEXT NOT NULL,
    release_year  INTEGER NOT NULL,
    price_cents   INTEGER NOT NULL CHECK (price_cents >= 0),
    cover_image   TEXT NOT NULL,
    description   TEXT NOT NULL DEFAULT '',
    stock         INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,

  `CREATE TABLE IF NOT EXISTS orders (
    id                SERIAL PRIMARY KEY,
    order_reference   TEXT NOT NULL UNIQUE,
    stripe_session_id TEXT UNIQUE,
    status            TEXT NOT NULL DEFAULT 'pending',
    total_cents       INTEGER NOT NULL DEFAULT 0 CHECK (total_cents >= 0),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,

  `CREATE TABLE IF NOT EXISTS order_line_items (
    id               SERIAL PRIMARY KEY,
    order_id         INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    record_id        INTEGER REFERENCES records(id) ON DELETE SET NULL,
    title            TEXT NOT NULL,
    artist           TEXT NOT NULL,
    cover_image      TEXT NOT NULL,
    unit_price_cents INTEGER NOT NULL CHECK (unit_price_cents >= 0),
    quantity         INTEGER NOT NULL CHECK (quantity > 0),
    line_total_cents INTEGER NOT NULL CHECK (line_total_cents >= 0)
  )`,

  `CREATE INDEX IF NOT EXISTS idx_records_genre ON records (genre)`,
  `CREATE INDEX IF NOT EXISTS idx_orders_stripe_session_id ON orders (stripe_session_id)`,
  `CREATE INDEX IF NOT EXISTS idx_order_line_items_order_id ON order_line_items (order_id)`,
]

/**
 * `ALTER TABLE`-style migrations that `CREATE TABLE IF NOT EXISTS` cannot detect
 * (new columns / indices on existing tables). Runs after `schemaStatements` in
 * every context. Empty today; append here as the schema evolves.
 */
export const migrationStatements: string[] = []

/**
 * Create/upgrade the schema against the given database URL. The caller passes
 * the URL — this function never reads `DATABASE_URL` from the environment.
 */
export async function initSchema(databaseUrl: string): Promise<void> {
  const sql = neon(databaseUrl)
  for (const stmt of [...schemaStatements, ...migrationStatements]) {
    await sql(stmt, [])
  }
  // Netlify Recorder tables (backend_requests, audit_log) + audit triggers.
  await runRecorderSchema(sql as unknown as RecorderSql)
}
