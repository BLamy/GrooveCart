import {
  backendRequestsEnsureTable,
  databaseAuditEnsureLogTable,
  databaseAuditMonitorTable,
} from '@replayio-app-building/netlify-recorder'

/**
 * Netlify Recorder schema setup for GrooveCart.
 *
 * The recorder package owns the DDL for its request store (`backend_requests`)
 * and audit log (`audit_log` + `audit_trigger_function`). Rather than copy that
 * SQL into this repo (and let it drift), we drive the package's `*EnsureTable`
 * helpers and reuse the result everywhere the schema is created:
 *
 *   - `runRecorderSchema(sql)` runs the helpers against a live Neon client.
 *     Used by `initSchema` (test branch + seed-db paths, which hold a real
 *     `DATABASE_URL`).
 *   - `recorderSchemaStatements()` runs the same helpers against a capturing
 *     stub and returns the raw SQL strings. Used by the deploy script, which
 *     has no `DATABASE_URL` in its environment and applies all DDL through the
 *     `neon-exec-sql-batch` allowlist verb.
 *
 * Both paths execute the identical statements; the package stays the single
 * source of truth for recorder DDL.
 */

/**
 * Tables whose row-level INSERT/UPDATE/DELETE we want stamped with the current
 * request id in `audit_log`. Every one uses `id` as its primary key, which is
 * the trigger default, so no PK override is needed.
 *  - orders / order_line_items — the purchase records written during checkout.
 *  - records — stock is decremented here when an order is fulfilled.
 */
export const MONITORED_TABLES = ['records', 'orders', 'order_line_items'] as const

/**
 * Shape the recorder helpers expect for the SQL client — deliberately the loose
 * `(...args) => Promise<any[]>` the package declares. The Neon tagged-template
 * client satisfies this at runtime; callers cast their client to it.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RecorderSql = (...args: any[]) => Promise<any[]>

async function applyRecorderSchema(sql: RecorderSql): Promise<void> {
  // 1. backend_requests — the captured-request store.
  await backendRequestsEnsureTable(sql)
  // 2. audit_log + audit_trigger_function.
  await databaseAuditEnsureLogTable(sql)
  // 3. Enable auditing on each monitored table (never audit_log itself).
  for (const table of MONITORED_TABLES) {
    await databaseAuditMonitorTable(sql, table)
  }
}

/** Create the recorder tables/triggers using a live Neon client. */
export async function runRecorderSchema(sql: RecorderSql): Promise<void> {
  await applyRecorderSchema(sql)
}

/**
 * Collect the recorder DDL as plain SQL strings by driving the package helpers
 * against a stub that captures, rather than executes, each tagged-template call.
 * The recorder helpers interpolate no values into their DDL, so a straight
 * concatenation of the template chunks reproduces each statement exactly.
 */
export async function recorderSchemaStatements(): Promise<string[]> {
  const statements: string[] = []
  const capture: RecorderSql = (strings: readonly string[], ...values: unknown[]) => {
    let sqlText = ''
    for (let i = 0; i < strings.length; i++) {
      sqlText += strings[i]
      if (i < values.length) sqlText += String(values[i])
    }
    statements.push(sqlText)
    return Promise.resolve([])
  }
  await applyRecorderSchema(capture)
  return statements
}
