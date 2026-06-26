import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Plus } from 'lucide-react'
import type { RecordItem } from '../../types'
import { useAppDispatch, useAppSelector } from '../../store'
import { addItem } from '../../slices/cartSlice'

interface RecordCardProps {
  record: RecordItem
}

/**
 * A catalog tile representing a single record: square cover, title, artist, a
 * genre tag, the price, and a stock signal. The cover/title area links to the
 * record's detail page. In-stock cards offer a quick "Add to Cart" action;
 * out-of-stock cards show a muted "Sold Out" badge with the add action disabled.
 *
 * Quick-add respects stock: once the cart already holds all available copies the
 * button is disabled so the cart can never exceed stock.
 */
export default function RecordCard({ record }: RecordCardProps) {
  const dispatch = useAppDispatch()
  const inCart = useAppSelector(
    (state) => state.cart.items.find((i) => i.recordId === record.id)?.quantity ?? 0,
  )
  const [justAdded, setJustAdded] = useState(false)

  const soldOut = record.stock <= 0
  const atStockLimit = inCart >= record.stock
  const canAdd = !soldOut && !atStockLimit

  const handleAdd = () => {
    if (!canAdd) return
    dispatch(addItem({ recordId: record.id, quantity: 1 }))
    setJustAdded(true)
    window.setTimeout(() => setJustAdded(false), 1200)
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-card border border-border bg-surface shadow-card transition-shadow hover:shadow-[0_2px_4px_rgba(28,25,23,0.06),0_12px_28px_rgba(28,25,23,0.10)]">
      <Link
        to={`/records/${record.id}`}
        className="flex flex-col"
        aria-label={`View details for ${record.title} by ${record.artist}`}
      >
        <div className="relative aspect-square overflow-hidden bg-surface-muted">
          <img
            src={record.coverImage}
            alt={`${record.title} cover art`}
            loading="lazy"
            className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03] ${
              soldOut ? 'opacity-60' : ''
            }`}
          />
          {soldOut && (
            <span className="absolute left-3 top-3 rounded-full bg-soldout px-2.5 py-1 text-xs font-semibold text-white">
              Sold Out
            </span>
          )}
        </div>
        <div className="flex flex-col gap-1 px-4 pt-4">
          <span className="w-fit rounded-full bg-accent-soft px-2 py-0.5 text-xs font-semibold text-accent">
            {record.genre}
          </span>
          <h3 className="mt-1 line-clamp-1 text-base font-bold text-text">{record.title}</h3>
          <p className="line-clamp-1 text-sm text-text-muted">{record.artist}</p>
        </div>
      </Link>

      <div className="mt-auto flex items-center justify-between gap-2 px-4 pb-4 pt-3">
        <div className="flex flex-col">
          <span className="text-lg font-extrabold text-text">${record.price.toFixed(2)}</span>
          {!soldOut && record.stock <= 3 && (
            <span className="text-xs font-medium text-accent">Only {record.stock} left</span>
          )}
        </div>
        {soldOut ? (
          <button
            type="button"
            disabled
            aria-label={`${record.title} is sold out`}
            className="cursor-not-allowed rounded-control bg-surface-muted px-3 py-2 text-sm font-semibold text-soldout"
          >
            Sold Out
          </button>
        ) : (
          <button
            type="button"
            onClick={handleAdd}
            disabled={!canAdd}
            aria-label={`Add ${record.title} to cart`}
            className="inline-flex items-center gap-1.5 rounded-control bg-accent px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:bg-soldout"
          >
            {justAdded ? (
              <>
                <Check className="h-4 w-4" aria-hidden="true" /> Added
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" aria-hidden="true" /> Add
              </>
            )}
          </button>
        )}
      </div>
    </article>
  )
}
