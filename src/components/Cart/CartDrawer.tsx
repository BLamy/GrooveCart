import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
import type { CartLine } from '../../types'
import { formatPrice } from '../../lib/format'
import { useAppDispatch, useAppSelector } from '../../store'
import { closeDrawer, selectCartItems, selectDrawerOpen } from '../../slices/cartSlice'
import { useRecords } from '../../hooks/useRecords'
import CartLineItem from './CartLineItem'
import CheckoutButton from './CheckoutButton'
import EmptyCartState from './EmptyCartState'

/**
 * Slide-in panel for quick cart access from any page. Opened from the SiteHeader
 * cart button, it lists the same session-persisted line items in compact form
 * with a small summary, a Checkout CTA, and a View Cart link to `/cart`. Closes
 * on the × button, an overlay click, or Escape (restoring focus to the cart
 * button). Shows the EmptyCartState when the cart has no items.
 */
export default function CartDrawer() {
  const dispatch = useAppDispatch()
  const open = useAppSelector(selectDrawerOpen)
  const items = useAppSelector(selectCartItems)
  const { recordsById } = useRecords()
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  function close() {
    dispatch(closeDrawer())
    // Restore focus to the cart button that opened the drawer.
    document.getElementById('cart-button')?.focus()
  }

  useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
    // `close` only reads stable dispatch; running this when `open` flips is correct.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  if (!open) return null

  const lines: CartLine[] = items
    .map((i) => {
      const record = recordsById.get(i.recordId)
      return record ? { record, quantity: i.quantity } : null
    })
    .filter((l): l is CartLine => l !== null)

  const subtotal = lines.reduce((sum, l) => sum + l.record.price * l.quantity, 0)
  const checkoutItems = items.map((i) => ({ recordId: i.recordId, quantity: i.quantity }))
  const isEmpty = items.length === 0

  return (
    <div className="fixed inset-0 z-50">
      <div
        data-testid="cart-drawer-overlay"
        onClick={close}
        className="absolute inset-0 bg-black/40"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        data-testid="cart-drawer"
        className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-[var(--gc-bg)] shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-[var(--gc-border)] bg-[var(--gc-surface)] px-5 py-4">
          <h2 className="text-lg font-bold text-[var(--gc-text)]">Your Cart</h2>
          <button
            type="button"
            ref={closeButtonRef}
            aria-label="Close cart"
            onClick={close}
            className="grid h-9 w-9 place-items-center rounded-[var(--gc-radius-control)] text-[var(--gc-text-muted)] transition-colors hover:bg-[var(--gc-surface-muted)] hover:text-[var(--gc-text)]"
          >
            <X size={20} />
          </button>
        </div>

        {isEmpty ? (
          <div className="flex flex-1 items-center justify-center">
            <EmptyCartState onBrowse={() => dispatch(closeDrawer())} />
          </div>
        ) : (
          <>
            <div className="flex-1 divide-y divide-[var(--gc-border)] overflow-y-auto px-5">
              {lines.map((l) => (
                <CartLineItem
                  key={l.record.id}
                  record={l.record}
                  quantity={l.quantity}
                  compact
                />
              ))}
            </div>

            <div className="border-t border-[var(--gc-border)] bg-[var(--gc-surface)] px-5 py-4">
              <div className="mb-3 flex items-center justify-between text-base font-bold text-[var(--gc-text)]">
                <span>Total</span>
                <span data-testid="drawer-total" className="tabular-nums">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <CheckoutButton items={checkoutItems} />
              <Link
                to="/cart"
                onClick={() => dispatch(closeDrawer())}
                className="mt-3 block rounded-[var(--gc-radius-control)] border border-[var(--gc-border)] py-2.5 text-center font-semibold text-[var(--gc-text)] transition-colors hover:border-[var(--gc-accent)] hover:text-[var(--gc-accent)]"
              >
                View Cart
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
