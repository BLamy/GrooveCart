import { ShoppingBag } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../store'
import { openDrawer, selectCartCount } from '../slices/cartSlice'

/**
 * Header cart button with a live item-count badge. Clicking it opens the
 * CartDrawer (it never changes the route). Carries a stable `id` so the drawer
 * can restore focus here when it closes.
 */
export default function CartButton() {
  const dispatch = useAppDispatch()
  const count = useAppSelector(selectCartCount)

  return (
    <button
      type="button"
      id="cart-button"
      onClick={() => dispatch(openDrawer())}
      aria-label={`Open cart, ${count} ${count === 1 ? 'item' : 'items'}`}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-[var(--gc-radius-control)] border border-[var(--gc-border)] bg-[var(--gc-surface)] text-[var(--gc-text)] transition-colors hover:border-[var(--gc-accent)] hover:text-[var(--gc-accent)]"
    >
      <ShoppingBag size={20} />
      {count > 0 && (
        <span
          data-testid="cart-count"
          className="absolute -right-2 -top-2 grid min-w-[1.25rem] place-items-center rounded-full bg-[var(--gc-accent)] px-1 text-xs font-bold text-white"
        >
          {count}
        </span>
      )}
    </button>
  )
}
