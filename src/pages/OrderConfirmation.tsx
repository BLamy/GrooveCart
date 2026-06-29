import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { Order } from '../types'
import { useAppDispatch } from '../store'
import { clearCart } from '../slices/cartSlice'
import SiteHeader from '../components/navigation/SiteHeader'
import SiteFooter from '../components/navigation/SiteFooter'
import ConfirmationHeader from '../components/OrderConfirmation/ConfirmationHeader'
import OrderSummaryList from '../components/OrderConfirmation/OrderSummaryList'
import OrderTotals from '../components/OrderConfirmation/OrderTotals'
import ConfirmationLoadingState from '../components/OrderConfirmation/ConfirmationLoadingState'
import ContinueShoppingButton from '../components/OrderConfirmation/ContinueShoppingButton'
import OrderNotFoundState from '../components/OrderConfirmation/OrderNotFoundState'

type Status = 'loading' | 'ready' | 'not-found'

/** Backoff schedule (ms) for polling the order while it finalizes server-side. */
const RETRY_DELAYS = [0, 700, 1100, 1500, 2000, 2500, 3000]

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * The post-purchase page reached via the Stripe success redirect
 * (`/order/confirmation?session_id=...`). It looks up the Stripe Checkout
 * session, retrying briefly until Stripe reports payment complete. On success it
 * empties the cart for the session and renders the order summary; otherwise it
 * shows a not-found state.
 */
export default function OrderConfirmation() {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const dispatch = useAppDispatch()

  const [status, setStatus] = useState<Status>('loading')
  const [order, setOrder] = useState<Order | null>(null)

  useEffect(() => {
    if (!sessionId) {
      setStatus('not-found')
      return
    }

    let active = true
    setStatus('loading')
    setOrder(null)

    async function poll() {
      for (const delay of RETRY_DELAYS) {
        if (delay) await sleep(delay)
        if (!active) return
        try {
          const res = await fetch(
            `/api/orders/by-session/${encodeURIComponent(sessionId as string)}`,
          )
          if (res.ok) {
            const data: Order = await res.json()
            if (data.status === 'paid') {
              if (!active) return
              setOrder(data)
              setStatus('ready')
              dispatch(clearCart())
              return
            }
            // Recorded but not yet finalized — keep polling.
          }
          // 404 (order not yet recorded) or pending: fall through and retry.
        } catch {
          // Network hiccup: retry on the next tick.
        }
      }
      if (active) setStatus('not-found')
    }

    poll()
    return () => {
      active = false
    }
  }, [sessionId, dispatch])

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <SiteHeader />
      <main
        className="mx-auto w-full max-w-2xl flex-1 px-6 py-12"
        data-testid="order-confirmation-page"
      >
        {status === 'loading' && <ConfirmationLoadingState />}

        {status === 'not-found' && <OrderNotFoundState />}

        {status === 'ready' && order && (
          <div className="flex flex-col gap-8">
            <ConfirmationHeader orderReference={order.orderReference} />
            <div className="flex flex-col gap-6 rounded-card border border-border bg-surface px-6 py-6 shadow-card">
              <OrderSummaryList lineItems={order.lineItems} />
              <OrderTotals total={order.total} />
            </div>
            <ContinueShoppingButton />
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
