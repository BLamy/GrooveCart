import { findCatalogRecord, priceCents } from './catalog'
import { getStripe } from './stripe'

/**
 * GET /api/orders/by-session/:sessionId — the recorded order for a Stripe
 * Checkout session, with its line items.
 *
 * The checkout function stores a compact `recordId:quantity` cart snapshot in
 * Stripe session metadata. This endpoint retrieves the session, verifies payment
 * state, and reconstructs the confirmation response from Stripe + the static
 * catalog, with no database dependency.
 */
interface CartQuantity {
  recordId: number
  quantity: number
}

function parseSessionId(req: Request): string | null {
  const segments = new URL(req.url).pathname.split('/').filter(Boolean)
  const idx = segments.lastIndexOf('by-session')
  const afterToken = idx !== -1 ? segments[idx + 1] : undefined
  if (afterToken) {
    return decodeURIComponent(afterToken)
  }
  // Fallback: the final segment, as long as it isn't a route token.
  const last = segments[segments.length - 1]
  if (last && last !== 'orders' && last !== 'by-session') return decodeURIComponent(last)
  return null
}

function parseCatalogItems(raw: string | null | undefined): CartQuantity[] | null {
  if (!raw) return null
  const items: CartQuantity[] = []
  for (const token of raw.split(',')) {
    const [recordRaw, quantityRaw] = token.split(':')
    const recordId = Number(recordRaw)
    const quantity = Number(quantityRaw)
    if (!Number.isInteger(recordId) || recordId <= 0) return null
    if (!Number.isInteger(quantity) || quantity <= 0) return null
    items.push({ recordId, quantity })
  }
  return items.length ? items : null
}

function serialize(sessionId: string, orderReference: string, status: string, created: number, items: CartQuantity[]) {
  const lineItems = items.map(({ recordId, quantity }) => {
    const record = findCatalogRecord(recordId)
    if (!record) {
      throw new Error(`Record ${recordId} missing from static catalog`)
    }
    const unitPriceCents = priceCents(record)
    const lineTotalCents = unitPriceCents * quantity
    return {
      recordId,
      title: record.title,
      artist: record.artist,
      coverImage: record.coverImage,
      unitPriceCents,
      unitPrice: unitPriceCents / 100,
      quantity,
      lineTotalCents,
      lineTotal: lineTotalCents / 100,
    }
  })
  const totalCents = lineItems.reduce((sum, line) => sum + line.lineTotalCents, 0)

  return {
    orderReference,
    sessionId,
    status,
    totalCents,
    total: totalCents / 100,
    createdAt: new Date(created * 1000).toISOString(),
    lineItems,
  }
}

async function handler(req: Request): Promise<Response> {
  if (req.method !== 'GET') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 })
  }

  const sessionId = parseSessionId(req)
  if (!sessionId) {
    return Response.json({ error: 'Missing session id' }, { status: 400 })
  }

  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId)
    const items = parseCatalogItems(session.metadata?.catalog_items)
    const orderReference = session.metadata?.order_reference
    if (!items || !orderReference) {
      return Response.json({ error: 'Order not found' }, { status: 404 })
    }

    const status =
      session.payment_status === 'paid' || session.status === 'complete' ? 'paid' : 'pending'

    return Response.json(
      serialize(session.id, orderReference, status, session.created, items),
    )
  } catch (err) {
    console.error('GET /api/orders/by-session failed', err)
    return Response.json({ error: 'Failed to load order' }, { status: 500 })
  }
}

export default handler
