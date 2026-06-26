import { formatPrice } from '../../lib/format'
import StockStatus from './StockStatus'

interface PriceBlockProps {
  /** Price in dollars. */
  price: number
  /** Stock quantity, passed through to the hosted StockStatus indicator. */
  stock: number
}

/**
 * Prominent price display that hosts the StockStatus availability indicator
 * beside it. Static / non-interactive (StockStatus manages its own hover).
 */
export default function PriceBlock({ price, stock }: PriceBlockProps) {
  return (
    <div data-testid="price-block" className="flex flex-wrap items-center gap-x-4 gap-y-3">
      <span data-testid="record-price" className="text-3xl font-bold text-text">
        {formatPrice(price)}
      </span>
      <StockStatus stock={stock} />
    </div>
  )
}
