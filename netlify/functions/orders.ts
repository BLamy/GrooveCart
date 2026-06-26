import { getSql } from './db'
import { getStripe } from './stripe'
import { withRecording } from './recording'

/**
 * GET /api/orders/by-session/:sessionId — the recorded order for a Stripe
 * Checkout session, with its line items.
 *
 * Fulfillment happens here, on first read after the Stripe success redirect
 * (GrooveCart is webhook-less): if the order is still `pending`, the function
 * retrieves the Stripe session and, when payment is confirmed, atomically flips
 * the order to `paid` and decrements the purchased records' stock. The status
 * transition is guarded so concurrent/repeated reads never double-decrement.
 *
 * The page polls this endpoint briefly after redirect, so an order that is a
 * moment behind still resolves rather than erroring.
 */
interface OrderRow {
  id: number
  order_reference: string
  stripe_session_id: string
  status: string
  total_cents: number
  created_at: string
}

interface LineItemRow {
  record_id: number | null
  title: string
  artist: string
  cover_image: string
  unit_price_cents: number
  quantity: number
  line_total_cents: number
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

async function loadLineItems(
  sql: ReturnType<typeof getSql>,
  orderId: number,
): Promise<LineItemRow[]> {
  return (await sql`
    SELECT record_id, title, artist, cover_image, unit_price_cents, quantity, line_total_cents
    FROM order_line_items
    WHERE order_id = ${orderId}
    ORDER BY id ASC
  `) as LineItemRow[]
}

function serialize(order: OrderRow, lineItems: LineItemRow[]) {
  return {
    orderReference: order.order_reference,
    sessionId: order.stripe_session_id,
    status: order.status,
    totalCents: order.total_cents,
    total: order.total_cents / 100,
    createdAt: order.created_at,
    lineItems: lineItems.map((li) => ({
      recordId: li.record_id,
      title: li.title,
      artist: li.artist,
      coverImage: li.cover_image,
      unitPriceCents: li.unit_price_cents,
      unitPrice: li.unit_price_cents / 100,
      quantity: li.quantity,
      lineTotalCents: li.line_total_cents,
      lineTotal: li.line_total_cents / 100,
    })),
  }
}

/**
 * If the order is pending and Stripe reports the session as paid, flip it to
 * `paid` and decrement stock exactly once. Returns the (possibly updated) order.
 */
async function fulfillIfPaid(
  sql: ReturnType<typeof getSql>,
  order: OrderRow,
  lineItems: LineItemRow[],
): Promise<OrderRow> {
  if (order.status !== 'pending') return order

  let paid = false
  try {
    const session = await getStripe().checkout.sessions.retrieve(order.stripe_session_id)
    paid = session.payment_status === 'paid' || session.status === 'complete'
  } catch (err) {
    // Stripe unreachable: leave the order pending; the client retries.
    console.error('Stripe session retrieve failed', err)
    return order
  }
  if (!paid) return order

  // Guarded transition: only the read that wins the pending->paid flip performs
  // the stock decrement, so duplicate reads can't decrement twice.
  const claimed = (await sql`
    UPDATE orders SET status = 'paid' WHERE id = ${order.id} AND status = 'pending'
    RETURNING id
  `) as Array<{ id: number }>

  if (claimed.length > 0) {
    for (const li of lineItems) {
      if (li.record_id !== null) {
        await sql`
          UPDATE records SET stock = GREATEST(stock - ${li.quantity}, 0)
          WHERE id = ${li.record_id}
        `
      }
    }
  }

  return { ...order, status: 'paid' }
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
    const sql = getSql()
    const orders = (await sql`
      SELECT id, order_reference, stripe_session_id, status, total_cents, created_at
      FROM orders
      WHERE stripe_session_id = ${sessionId}
    `) as OrderRow[]

    let order = orders[0]
    if (!order) {
      return Response.json({ error: 'Order not found' }, { status: 404 })
    }

    const lineItems = await loadLineItems(sql, order.id)
    order = await fulfillIfPaid(sql, order, lineItems)

    return Response.json(serialize(order, lineItems))
  } catch (err) {
    console.error('GET /api/orders/by-session failed', err)
    return Response.json({ error: 'Failed to load order' }, { status: 500 })
  }
}

export default withRecording('netlify/functions/orders', handler)
