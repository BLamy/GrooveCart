import { randomUUID } from 'node:crypto'
import { findCatalogRecord, priceCents, type CatalogRecord } from './catalog'
import { getStripe } from './stripe'

/**
 * POST /api/checkout — start a Stripe Checkout session for the current cart.
 *
 * The client posts the cart line items (record ids + quantities). The function:
 *  1. Loads the referenced records from the static catalog and validates stock.
 *  2. Creates a Stripe Product + Price for each line and a Stripe Checkout
 *     session (hosted, server-side) with the matching line items.
 *  3. Stores the compact cart snapshot in Stripe session metadata so the
 *     confirmation page can render using Stripe + the static catalog only.
 *  4. Returns the session's hosted-checkout URL for the browser to redirect to.
 *
 * Stock is static display data in this version. It gates checkout quantities but
 * is not decremented globally after payment because there is no database.
 *
 * GrooveCart never collects card details: Stripe owns the payment step. On
 * success Stripe redirects to `/order/confirmation?session_id=...`; on cancel it
 * returns the shopper to `/cart` with items intact.
 */
interface IncomingItem {
  recordId: number
  quantity: number
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

function parseCustomerEmail(body: unknown): string | null {
  if (typeof body !== 'object' || body === null) return null
  const raw = (body as { customerEmail?: unknown }).customerEmail
  if (typeof raw !== 'string') return null
  const email = raw.trim()
  return email.includes('@') ? email : null
}

function resolveOrigin(req: Request): string {
  const fromHeader = req.headers.get('origin')
  if (fromHeader) return fromHeader.replace(/\/$/, '')
  if (process.env.PUBLIC_BASE_URL) return process.env.PUBLIC_BASE_URL.replace(/\/$/, '')
  return new URL(req.url).origin
}

function encodeCartMetadata(lines: Array<{ record: CatalogRecord; quantity: number }>): string {
  return lines.map((line) => `${line.record.id}:${line.quantity}`).join(',')
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
  const customerEmail = parseCustomerEmail(body)
  if (!customerEmail) {
    return Response.json({ error: 'Email address is required for checkout' }, { status: 400 })
  }

  // Collapse duplicate record ids into a single quantity per record.
  const quantities = new Map<number, number>()
  for (const item of items) {
    quantities.set(item.recordId, (quantities.get(item.recordId) ?? 0) + item.quantity)
  }

  try {
    // Validate every line against the static catalog stock caps.
    const lines: Array<{ record: CatalogRecord; quantity: number; lineTotalCents: number }> = []
    for (const [recordId, quantity] of quantities) {
      const record = findCatalogRecord(recordId)
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
      lines.push({ record, quantity, lineTotalCents: priceCents(record) * quantity })
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
        name: `${line.record.title} - ${line.record.artist}`,
        images: [line.record.coverImage],
        metadata: { record_id: String(line.record.id) },
      })
      const price = await stripe.prices.create({
        product: product.id,
        currency: 'usd',
        unit_amount: priceCents(line.record),
      })
      stripeLineItems.push({ price: price.id, quantity: line.quantity })
    }

    const orderReference = `GC-${randomUUID().slice(0, 8).toUpperCase()}`

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: stripeLineItems,
      customer_email: customerEmail,
      success_url: `${origin}/order/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
      metadata: {
        order_reference: orderReference,
        catalog_items: encodeCartMetadata(lines),
        customer_email: customerEmail,
        total_cents: String(totalCents),
      },
    })

    return Response.json({ url: session.url, sessionId: session.id, orderReference })
  } catch (err) {
    console.error('POST /api/checkout failed', err)
    return Response.json({ error: 'Could not start checkout' }, { status: 500 })
  }
}

export default handler
