/**
 * A vinyl record as returned by the records API (`GET /api/records` and
 * `GET /api/records/:id`).
 *
 * Named `RecordItem` (not `Record`) so it never shadows TypeScript's built-in
 * `Record<K, V>` utility type. `price` is in dollars (the API converts the
 * stored integer cents to a dollar amount); `stock` is the number of copies
 * available.
 */
export interface RecordItem {
  id: number
  title: string
  artist: string
  genre: string
  releaseYear: number
  price: number
  coverImage: string
  description: string
  stock: number
}

/** A cart line item hydrated with its record details for rendering and totals. */
export interface CartLine {
  record: RecordItem
  quantity: number
}

/**
 * A single purchased line on a completed order, as returned by
 * `GET /api/orders/by-session/:sessionId`. Prices are in dollars; the
 * title/artist/cover are snapshotted on the order so it renders correctly even
 * if the catalog later changes.
 */
export interface OrderLineItem {
  recordId: number | null
  title: string
  artist: string
  coverImage: string
  unitPrice: number
  quantity: number
  lineTotal: number
}

/**
 * A recorded order keyed by its Stripe Checkout session reference. `status` is
 * `'paid'` once payment has been confirmed and the order fulfilled.
 */
export interface Order {
  orderReference: string
  sessionId: string
  status: string
  total: number
  createdAt: string
  lineItems: OrderLineItem[]
}
