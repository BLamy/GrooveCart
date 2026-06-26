import { createRecordingEndpoint } from '@replayio-app-building/netlify-recorder'
import { getSql } from './db'

/**
 * Backend request recording endpoint.
 *
 * Every app exposes this function under the consistent name
 * `backend-request-recording` so any caller (app code, container debugging,
 * external services) can trigger/inspect a recording without app-specific
 * knowledge.
 *
 *   POST { "requestId": "<uuid>" }   — create the recording if needed; returns status
 *   GET  ?requestId=<uuid>           — return the current recording status
 *
 * The hosted recorder service reads the captured blob URL stored in
 * `backend_requests` to produce the recording on demand.
 */
export default createRecordingEndpoint({
  // The recorder's `sql` type is the loose `(...args) => Promise<any[]>`; the
  // Neon client satisfies it at runtime.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sql: getSql() as unknown as (...args: any[]) => Promise<any[]>,
  recorderUrl: 'https://netlify-recorder-bm4wmw.netlify.app',
})
