import { ShoppingBag } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../store'
import { openDrawer } from '../../slices/cartSlice'

/**
 * The header cart button. Shows a cart icon with a live badge reflecting the
 * total quantity of records currently in the cart, and opens the slide-in
 * CartDrawer when clicked (without changing the route). The badge is hidden
 * while the cart is empty and updates as items are added or removed elsewhere.
 */
export default function CartButton() {
  const dispatch = useAppDispatch()
  const count = useAppSelector((state) =>
    state.cart.items.reduce((sum, item) => sum + item.quantity, 0),
  )

  return (
    <button
      type="button"
      onClick={() => dispatch(openDrawer())}
      aria-label={`Open cart, ${count} item${count === 1 ? '' : 's'}`}
      className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-control border border-border bg-surface text-text transition-colors hover:border-accent hover:text-accent"
    >
      <ShoppingBag className="h-5 w-5" aria-hidden="true" />
      {count > 0 && (
        <span
          data-testid="cart-count"
          className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-xs font-bold text-white"
        >
          {count}
        </span>
      )}
    </button>
  )
}
