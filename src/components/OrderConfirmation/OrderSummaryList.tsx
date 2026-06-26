import type { OrderLineItem } from '../../types'

interface OrderSummaryListProps {
  lineItems: OrderLineItem[]
}

/**
 * The list of purchased line items for a completed order. Each row shows the
 * cover thumbnail, title, artist, the quantity × unit price, and the line total.
 */
export default function OrderSummaryList({ lineItems }: OrderSummaryListProps) {
  return (
    <ul className="flex flex-col divide-y divide-border" data-testid="order-summary-list">
      {lineItems.map((item, index) => (
        <li
          key={item.recordId ?? `${item.title}-${index}`}
          className="flex items-center gap-4 py-4"
          data-testid="order-line-item"
        >
          <img
            src={item.coverImage}
            alt={`${item.title} cover art`}
            className="h-16 w-16 flex-none rounded-control bg-surface-muted object-cover"
          />
          <div className="flex min-w-0 flex-1 flex-col">
            <p className="truncate text-sm font-bold text-text">{item.title}</p>
            <p className="truncate text-sm text-text-muted">{item.artist}</p>
            <p className="mt-1 text-xs text-text-muted">
              Qty {item.quantity} × ${item.unitPrice.toFixed(2)}
            </p>
          </div>
          <span className="flex-none text-sm font-semibold text-text">
            ${item.lineTotal.toFixed(2)}
          </span>
        </li>
      ))}
    </ul>
  )
}
