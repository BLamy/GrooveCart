import type { CartLine } from '../../types'
import { formatPrice } from '../../lib/format'
import CheckoutButton from './CheckoutButton'

interface OrderSummaryProps {
  lines: CartLine[]
}

/**
 * The sticky right-column summary on the Cart page. Rolls each line up
 * (record × quantity → line total), shows the subtotal and order total (which
 * equals the subtotal — shipping/tax are handled by Stripe's hosted checkout),
 * and hosts the primary CheckoutButton. All totals are computed on the client
 * from the line items.
 */
export default function OrderSummary({ lines }: OrderSummaryProps) {
  const subtotal = lines.reduce((sum, l) => sum + l.record.price * l.quantity, 0)
  const checkoutItems = lines.map((l) => ({ recordId: l.record.id, quantity: l.quantity }))

  return (
    <aside
      data-testid="order-summary"
      className="sticky top-24 rounded-[var(--gc-radius-card)] border border-[var(--gc-border)] bg-[var(--gc-surface)] p-5 shadow-[var(--gc-shadow-card)]"
    >
      <h2 className="text-lg font-bold text-[var(--gc-text)]">Order Summary</h2>

      <ul className="mt-4 flex flex-col gap-2 border-b border-[var(--gc-border)] pb-4">
        {lines.map((l) => (
          <li key={l.record.id} className="flex items-start justify-between gap-3 text-sm">
            <span className="min-w-0 text-[var(--gc-text-muted)]">
              <span className="truncate text-[var(--gc-text)]">{l.record.title}</span>
              <span className="text-[var(--gc-text-muted)]"> × {l.quantity}</span>
            </span>
            <span className="shrink-0 tabular-nums text-[var(--gc-text)]">
              {formatPrice(l.record.price * l.quantity)}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex items-center justify-between text-sm text-[var(--gc-text-muted)]">
        <span>Subtotal</span>
        <span data-testid="summary-subtotal" className="tabular-nums text-[var(--gc-text)]">
          {formatPrice(subtotal)}
        </span>
      </div>

      <div className="mt-2 flex items-center justify-between text-base font-bold text-[var(--gc-text)]">
        <span>Total</span>
        <span data-testid="summary-total" className="tabular-nums">
          {formatPrice(subtotal)}
        </span>
      </div>

      <p className="mt-1 text-xs text-[var(--gc-text-muted)]">
        Shipping &amp; tax calculated at checkout.
      </p>

      <div className="mt-5">
        <CheckoutButton items={checkoutItems} />
      </div>
    </aside>
  )
}
