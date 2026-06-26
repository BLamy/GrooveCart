import {
  createRecordingRequestHandler,
  databaseCallbacks,
} from '@replayio-app-building/netlify-recorder'
import { getSql } from './db'

/**
 * Netlify Recorder glue for GrooveCart's functions.
 *
 * `withRecording` wraps a Web-API (`Request` → `Response`) handler with
 * `createRecordingRequestHandler` so each invocation is captured as a Replay
 * recording: outbound `fetch` calls and `process.env` reads are recorded, the
 * blob is uploaded to UploadThing, a row is written to `backend_requests`, and
 * the response carries an `X-Replay-Request-Id` header.
 *
 * Two adaptations on top of the raw wrapper:
 *  - The wrapper normalizes responses to the Lambda-style `{statusCode, body,
 *    headers}` object. Our functions are v2 default exports, so we convert that
 *    back into a real `Response` before returning to the Netlify runtime.
 *  - The recorder client (and thus `getSql()`) is constructed lazily on first
 *    request, so importing a function module never requires `DATABASE_URL`.
 *
 * Capture is best-effort: the wrapper runs blob upload / row insert through
 * `context.waitUntil` (or a caught inline await) and swallows failures, so a
 * missing `UPLOADTHING_TOKEN`/`COMMIT_SHA` (e.g. in local tests) never affects
 * the response the shopper sees.
 */

type RequestHandler = (req: Request) => Promise<Response>

interface LambdaResponse {
  statusCode: number
  body?: string
  headers?: Record<string, string>
}

// The recorder's helper types are intentionally loose (`(...args) => Promise<...>`)
// and don't line up with the Neon client / Web-API handler types; bridge them.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFn = (...args: any[]) => any
type Wrapped = (req: Request, context?: unknown) => Promise<LambdaResponse>

export function withRecording(handlerPath: string, handler: RequestHandler) {
  let wrapped: Wrapped | null = null

  function getWrapped(): Wrapped {
    if (!wrapped) {
      wrapped = createRecordingRequestHandler(handler as unknown as AnyFn, {
        callbacks: databaseCallbacks(getSql() as unknown as AnyFn),
        handlerPath,
      }) as unknown as Wrapped
    }
    return wrapped
  }

  return async (req: Request, context?: unknown): Promise<Response> => {
    const result = await getWrapped()(req, context)
    return new Response(result.body ?? '', {
      status: result.statusCode,
      headers: result.headers,
    })
  }
}
