import { Link } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import type { RecordItem } from '../../types'
import { formatPrice } from '../../lib/format'
import { useAppDispatch } from '../../store'
import { removeItem, setQuantity } from '../../slices/cartSlice'
import QuantityStepper from '../QuantityStepper'

interface CartLineItemProps {
  record: RecordItem
  quantity: number
  /** Compact layout for the CartDrawer (smaller thumbnail / controls). */
  compact?: boolean
}

/**
 * One record in the cart: cover thumbnail, title/artist (linking to the detail
 * page), unit price, a bounded QuantityStepper, the per-line total, and a remove
 * action. Quantity changes and removals write straight to the shared cart state.
 */
export default function CartLineItem({ record, quantity, compact = false }: CartLineItemProps) {
  const dispatch = useAppDispatch()
  const lineTotal = record.price * quantity
  const detailPath = `/records/${record.id}`
  const thumb = compact ? 'h-16 w-16' : 'h-24 w-24'

  return (
    <div
      data-testid="cart-line-item"
      data-record-id={record.id}
      className="flex gap-4 py-4"
    >
      <Link to={detailPath} className="shrink-0">
        <img
          src={record.coverImage}
          alt={`${record.title} by ${record.artist}`}
          className={`${thumb} rounded-[var(--gc-radius-control)] border border-[var(--gc-border)] object-cover`}
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Link to={detailPath} className="min-w-0">
          <h3 className="truncate font-semibold text-[var(--gc-text)] hover:text-[var(--gc-accent)]">
            {record.title}
          </h3>
        </Link>
        <p className="truncate text-sm text-[var(--gc-text-muted)]">{record.artist}</p>
        <p className="text-sm text-[var(--gc-text-muted)]">
          {formatPrice(record.price)} each
        </p>

        <div className="mt-1 flex items-center gap-3">
          <QuantityStepper
            value={quantity}
            max={record.stock}
            size={compact ? 'sm' : 'md'}
            label={`Quantity for ${record.title}`}
            onChange={(next) =>
              dispatch(setQuantity({ recordId: record.id, quantity: next }))
            }
          />
          <button
            type="button"
            aria-label={`Remove ${record.title} from cart`}
            onClick={() => dispatch(removeItem({ recordId: record.id, title: record.title }))}
            className="inline-flex items-center gap-1 text-sm text-[var(--gc-text-muted)] transition-colors hover:text-[var(--gc-accent)]"
          >
            <Trash2 size={16} />
            {!compact && <span>Remove</span>}
          </button>
        </div>
      </div>

      <div
        data-testid="line-total"
        className="shrink-0 text-right font-semibold tabular-nums text-[var(--gc-text)]"
      >
        {formatPrice(lineTotal)}
      </div>
    </div>
  )
}
