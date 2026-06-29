import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { createServer as createViteServer } from 'vite'
import checkoutHandler from '../netlify/functions/checkout'
import ordersHandler from '../netlify/functions/orders'
import recordsHandler from '../netlify/functions/records'

type FunctionHandler = (req: Request) => Promise<Response>

const port = Number(process.env.PORT ?? 8888)

function headersFromNode(req: IncomingMessage): Headers {
  const headers = new Headers()
  for (const [key, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) {
      for (const item of value) headers.append(key, item)
    } else if (value !== undefined) {
      headers.set(key, value)
    }
  }
  return headers
}

async function readBody(req: IncomingMessage): Promise<Uint8Array | undefined> {
  if (req.method === 'GET' || req.method === 'HEAD') return undefined

  const chunks: Buffer[] = []
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }
  if (chunks.length === 0) return undefined
  return Buffer.concat(chunks)
}

async function toWebRequest(req: IncomingMessage): Promise<Request> {
  const host = req.headers.host ?? `localhost:${port}`
  const url = new URL(req.url ?? '/', `http://${host}`)
  const body = await readBody(req)

  return new Request(url, {
    method: req.method ?? 'GET',
    headers: headersFromNode(req),
    body,
  })
}

async function sendWebResponse(res: ServerResponse, response: Response): Promise<void> {
  res.statusCode = response.status
  response.headers.forEach((value, key) => {
    res.setHeader(key, value)
  })
  const body = Buffer.from(await response.arrayBuffer())
  res.end(body)
}

function handlerForPath(pathname: string): FunctionHandler | null {
  if (pathname.startsWith('/api/checkout')) return checkoutHandler
  if (pathname.startsWith('/api/orders')) return ordersHandler
  if (pathname.startsWith('/api/records')) return recordsHandler
  return null
}

const vite = await createViteServer({
  appType: 'spa',
  server: { middlewareMode: true },
})

const server = createServer(async (req, res) => {
  const host = req.headers.host ?? `localhost:${port}`
  const url = new URL(req.url ?? '/', `http://${host}`)
  const handler = handlerForPath(url.pathname)

  if (handler) {
    try {
      const response = await handler(await toWebRequest(req))
      await sendWebResponse(res, response)
    } catch (err) {
      console.error('e2e api handler failed', err)
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: 'Internal server error' }))
    }
    return
  }

  vite.middlewares(req, res, (err: unknown) => {
    if (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      vite.ssrFixStacktrace(error)
      console.error(err)
      res.statusCode = 500
      res.end(error.message)
    }
  })
})

server.listen(port, () => {
  console.log(`GrooveCart e2e server ready at http://localhost:${port}`)
})

async function shutdown(): Promise<void> {
  await new Promise<void>((resolve) => server.close(() => resolve()))
  await vite.close()
}

process.on('SIGTERM', () => {
  void shutdown().finally(() => process.exit(0))
})

process.on('SIGINT', () => {
  void shutdown().finally(() => process.exit(0))
})
