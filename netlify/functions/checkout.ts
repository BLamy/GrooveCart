import { randomUUID } from 'node:crypto'
import { getSql } from './db'
import { getStripe } from './stripe'
import { withRecording } from './recording'

/**
 * POST /api/checkout — start a Stripe Checkout session for the current cart.
 *
 * The client posts the cart line items (record ids + quantities). The function:
 *  1. Loads the referenced records and validates availability against stock.
 *  2. Creates a Stripe Product + Price for each line and a Stripe Checkout
 *     session (hosted, server-side) with the matching line items.
 *  3. Records a `pending` order keyed by the Stripe session id, snapshotting the
 *     title/artist/cover/unit price of every line so the confirmation renders
 *     correctly even if the catalog later changes.
 *  4. Returns the session's hosted-checkout URL for the browser to redirect to.
 *
 * Stock is NOT decremented here — that happens only once payment is confirmed
 * (see `orders.ts`), so a cancelled checkout leaves the catalog untouched.
 *
 * GrooveCart never collects card details: Stripe owns the payment step. On
 * success Stripe redirects to `/order/confirmation?session_id=...`; on cancel it
 * returns the shopper to `/cart` with items intact.
 */
interface IncomingItem {
  recordId: number
  quantity: number
}

interface RecordRow {
  id: number
  title: string
  artist: string
  cover_image: string
  price_cents: number
  stock: number
}

function parseItems(body: unknown): IncomingItem[] | null {
  if (typeof body !== 'object' || body === null) return null
  const items = (body as { items?: unknown }).items
  if (!Array.isArray(items) || items.length === 0) return null

  const parsed: IncomingItem[] = []
  for (const raw of items) {
    if (typeof raw !== 'object' || raw === null) return null
    const recordId = Number((raw as { recordId?: unknown }).recordId)
    const quantity = Number((raw as { quantity?: unknown }).quantity)
    if (!Number.isInteger(recordId) || recordId <= 0) return null
    if (!Number.isInteger(quantity) || quantity <= 0) return null
    parsed.push({ recordId, quantity })
  }
  return parsed
}

function resolveOrigin(req: Request): string {
  const fromHeader = req.headers.get('origin')
  if (fromHeader) return fromHeader.replace(/\/$/, '')
  if (process.env.PUBLIC_BASE_URL) return process.env.PUBLIC_BASE_URL.replace(/\/$/, '')
  return new URL(req.url).origin
}

async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const items = parseItems(body)
  if (!items) {
    return Response.json({ error: 'Cart is empty or invalid' }, { status: 400 })
  }

  // Collapse duplicate record ids into a single quantity per record.
  const quantities = new Map<number, number>()
  for (const item of items) {
    quantities.set(item.recordId, (quantities.get(item.recordId) ?? 0) + item.quantity)
  }
  const recordIds = [...quantities.keys()]

  try {
    const sql = getSql()
    const rows = (await sql`
      SELECT id, title, artist, cover_image, price_cents, stock
      FROM records
      WHERE id = ANY(${recordIds}::int[])
    `) as RecordRow[]

    const byId = new Map(rows.map((r) => [r.id, r]))

    // Validate every line against the authoritative catalog/stock.
    const lines: Array<{ record: RecordRow; quantity: number; lineTotalCents: number }> = []
    for (const [recordId, quantity] of quantities) {
      const record = byId.get(recordId)
      if (!record) {
        return Response.json({ error: `Record ${recordId} is no longer available` }, { status: 409 })
      }
      if (record.stock <= 0) {
        return Response.json({ error: `${record.title} is sold out` }, { status: 409 })
      }
      if (quantity > record.stock) {
        return Response.json(
          { error: `Only ${record.stock} of ${record.title} left in stock` },
          { status: 409 },
        )
      }
      lines.push({ record, quantity, lineTotalCents: record.price_cents * quantity })
    }

    const totalCents = lines.reduce((sum, l) => sum + l.lineTotalCents, 0)
    const origin = resolveOrigin(req)
    const stripe = getStripe()

    // Build Stripe line items by creating a Product + Price per record. This
    // works against both the real Stripe API and the local emulator (which
    // requires line items to reference existing Price ids rather than inline
    // price data).
    const stripeLineItems: Array<{ price: string; quantity: number }> = []
    for (const line of lines) {
      const product = await stripe.products.create({
        name: `${line.record.title} — ${line.record.artist}`,
      })
      const price = await stripe.prices.create({
        product: product.id,
        currency: 'usd',
        unit_amount: line.record.price_cents,
      })
      stripeLineItems.push({ price: price.id, quantity: line.quantity })
    }

    const orderReference = `GC-${randomUUID().slice(0, 8).toUpperCase()}`

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: stripeLineItems,
      success_url: `${origin}/order/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
      metadata: { order_reference: orderReference },
    })

    // Record the pending order + snapshotted line items keyed by the session id.
    const inserted = (await sql`
      INSERT INTO orders (order_reference, stripe_session_id, status, total_cents)
      VALUES (${orderReference}, ${session.id}, 'pending', ${totalCents})
      RETURNING id
    `) as Array<{ id: number }>
    const orderRow = inserted[0]
    if (!orderRow) {
      throw new Error('Failed to record order')
    }
    const orderId = orderRow.id

    for (const line of lines) {
      await sql`
        INSERT INTO order_line_items
          (order_id, record_id, title, artist, cover_image, unit_price_cents, quantity, line_total_cents)
        VALUES (
          ${orderId}, ${line.record.id}, ${line.record.title}, ${line.record.artist},
          ${line.record.cover_image}, ${line.record.price_cents}, ${line.quantity}, ${line.lineTotalCents}
        )
      `
    }

    return Response.json({ url: session.url, sessionId: session.id, orderReference })
  } catch (err) {
    console.error('POST /api/checkout failed', err)
    return Response.json({ error: 'Could not start checkout' }, { status: 500 })
  }
}

export default withRecording('netlify/functions/checkout', handler)
