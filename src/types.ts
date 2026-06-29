/**
 * A vinyl record as returned by the static catalog JSON.
 *
 * Named `RecordItem` (not `Record`) so it never shadows TypeScript's built-in
 * `Record<K, V>` utility type. `price` is in dollars; `stock` is the number of
 * copies displayed and used as the checkout quantity cap.
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
 * `GET /api/orders/by-session/:sessionId`. Prices are in dollars.
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
 * An order reconstructed from its Stripe Checkout session reference. `status` is
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
