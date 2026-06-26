import { useNavigate } from 'react-router-dom'
import { Disc3 } from 'lucide-react'

interface EmptyCartStateProps {
  /**
   * Optional hook run just before navigating to the Storefront — the CartDrawer
   * uses it to close itself as it sends the shopper to browse.
   */
  onBrowse?: () => void
}

/**
 * Friendly empty state shown wherever the cart is rendered but holds no items
 * (the full Cart page and inside the CartDrawer). Offers a single primary
 * "Browse Records" action back to the Storefront.
 */
export default function EmptyCartState({ onBrowse }: EmptyCartStateProps) {
  const navigate = useNavigate()

  function handleBrowse() {
    onBrowse?.()
    navigate('/')
  }

  return (
    <div
      data-testid="empty-cart-state"
      className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center"
    >
      <span className="grid h-16 w-16 place-items-center rounded-full bg-[var(--gc-surface-muted)] text-[var(--gc-text-muted)]">
        <Disc3 size={32} />
      </span>
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold text-[var(--gc-text)]">Your cart is empty</h2>
        <p className="max-w-sm text-sm text-[var(--gc-text-muted)]">
          You haven&apos;t added any records yet. Dig through the crates and find
          something to spin.
        </p>
      </div>
      <button
        type="button"
        onClick={handleBrowse}
        className="inline-flex items-center justify-center rounded-[var(--gc-radius-control)] bg-[var(--gc-accent)] px-5 py-3 font-semibold text-white transition-colors hover:bg-[var(--gc-accent-hover)]"
      >
        Browse Records
      </button>
    </div>
  )
}
