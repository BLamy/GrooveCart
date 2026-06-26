import type { CartLine } from '../types'
import { useAppSelector } from '../store'
import { selectCartCount, selectCartItems } from '../slices/cartSlice'
import { useRecords } from '../hooks/useRecords'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import CartLineItem from '../components/Cart/CartLineItem'
import OrderSummary from '../components/Cart/OrderSummary'
import EmptyCartState from '../components/Cart/EmptyCartState'
import RemovedItemBanner from '../components/Cart/RemovedItemBanner'
import CartListSkeleton from '../components/Cart/CartListSkeleton'

/**
 * The full Cart page (`/cart`): the expanded, two-column view of the same
 * session-persisted cart shown in the CartDrawer. The left column is the
 * line-item list; the right is the sticky OrderSummary. When the cart is empty
 * the layout is replaced by the EmptyCartState. The RemovedItemBanner confirms
 * removals near the top of the content.
 */
export default function Cart() {
  const items = useAppSelector(selectCartItems)
  const itemCount = useAppSelector(selectCartCount)
  const { recordsById, loading } = useRecords()

  const lines: CartLine[] = items
    .map((i) => {
      const record = recordsById.get(i.recordId)
      return record ? { record, quantity: i.quantity } : null
    })
    .filter((l): l is CartLine => l !== null)

  const isEmpty = items.length === 0
  const hydrating = loading && lines.length === 0

  return (
    <div className="flex min-h-screen flex-col bg-[var(--gc-bg)]">
      <SiteHeader />

      <main className="mx-auto w-full max-w-[var(--gc-max-width)] flex-1 px-4 py-8 sm:px-6">
        <RemovedItemBanner />

        {isEmpty ? (
          <EmptyCartState />
        ) : (
          <>
            <div className="mb-6 flex items-baseline gap-3">
              <h1 className="text-2xl font-bold text-[var(--gc-text)]">Your Cart</h1>
              <span className="text-sm text-[var(--gc-text-muted)]">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_22rem]">
              <section className="rounded-[var(--gc-radius-card)] border border-[var(--gc-border)] bg-[var(--gc-surface)] px-5 shadow-[var(--gc-shadow-card)]">
                {hydrating ? (
                  <CartListSkeleton rows={items.length || 3} />
                ) : (
                  <div className="divide-y divide-[var(--gc-border)]">
                    {lines.map((l) => (
                      <CartLineItem key={l.record.id} record={l.record} quantity={l.quantity} />
                    ))}
                  </div>
                )}
              </section>

              {!hydrating && (
                <div>
                  <OrderSummary lines={lines} />
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <SiteFooter />
    </div>
  )
}
