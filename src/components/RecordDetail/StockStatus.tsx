import { useState } from 'react'
import { stockDetail, stockLabel, stockLevel } from '../../lib/stock'

interface StockStatusProps {
  /** The record's current stock quantity. */
  stock: number
}

const LEVEL_STYLES: Record<ReturnType<typeof stockLevel>, string> = {
  'in-stock': 'bg-success-soft text-success',
  'low-stock': 'bg-warning-soft text-warning',
  'sold-out': 'bg-danger-soft text-danger',
}

const DOT_STYLES: Record<ReturnType<typeof stockLevel>, string> = {
  'in-stock': 'bg-success',
  'low-stock': 'bg-warning',
  'sold-out': 'bg-danger',
}

/**
 * Availability indicator derived from a record's stock quantity:
 * "In stock" (green), "Only N left" (amber), or "Sold out" (red). Hovering (or
 * focusing) the indicator reveals a tooltip with more detailed availability
 * information. It is a non-mutating status signal — not a control.
 */
export default function StockStatus({ stock }: StockStatusProps) {
  const [open, setOpen] = useState(false)
  const level = stockLevel(stock)

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <span
        data-testid="stock-status"
        data-level={level}
        tabIndex={0}
        aria-label={stockDetail(stock)}
        className={`inline-flex items-center gap-2 rounded-control px-3 py-1.5 text-sm font-semibold ${LEVEL_STYLES[level]}`}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        <span className={`h-2 w-2 rounded-full ${DOT_STYLES[level]}`} aria-hidden="true" />
        {stockLabel(stock)}
      </span>
      {open && (
        <span
          role="tooltip"
          data-testid="stock-status-tooltip"
          className="absolute bottom-full left-0 z-20 mb-2 w-max max-w-xs rounded-control bg-text px-3 py-2 text-xs font-medium text-surface shadow-card"
        >
          {stockDetail(stock)}
        </span>
      )}
    </span>
  )
}
