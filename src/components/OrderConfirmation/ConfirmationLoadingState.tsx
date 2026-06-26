import { Loader2 } from 'lucide-react'

/**
 * Shown in the summary area while the order is looked up immediately after the
 * Stripe success redirect — or while the order is still being finalized
 * server-side. A calm spinner plus a graceful message so the wait never reads as
 * a blank or broken page.
 */
export default function ConfirmationLoadingState() {
  return (
    <div
      className="flex flex-col items-center gap-4 rounded-card border border-border bg-surface px-6 py-16 text-center shadow-card"
      data-testid="confirmation-loading"
    >
      <Loader2 className="h-8 w-8 animate-spin text-accent" aria-hidden="true" />
      <div className="flex flex-col gap-1">
        <p className="text-base font-semibold text-text">Finalizing your order…</p>
        <p className="text-sm text-text-muted">
          Hang tight while we confirm your payment and pull up your receipt.
        </p>
      </div>
    </div>
  )
}
