import { Link } from 'react-router-dom'
import { SearchX } from 'lucide-react'

/**
 * Shown when the `session_id` is missing or no order resolves for it after
 * retrying — a clear "we couldn't find that order" message with a way back to
 * the Storefront, instead of a blank or half-rendered summary.
 */
export default function OrderNotFoundState() {
  return (
    <div
      className="flex flex-col items-center gap-4 rounded-card border border-border bg-surface px-6 py-16 text-center shadow-card"
      data-testid="order-not-found"
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-muted text-text-muted">
        <SearchX className="h-7 w-7" aria-hidden="true" />
      </span>
      <div className="flex flex-col gap-1">
        <p className="text-base font-semibold text-text">We couldn&apos;t find that order</p>
        <p className="text-sm text-text-muted">
          This order may still be finalizing, or the link may be incomplete. If you just paid,
          give it a moment and refresh.
        </p>
      </div>
      <Link
        to="/"
        className="inline-flex items-center justify-center rounded-control bg-accent px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
      >
        Back to the Storefront
      </Link>
    </div>
  )
}
