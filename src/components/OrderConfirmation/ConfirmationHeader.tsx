import { CheckCircle2 } from 'lucide-react'

interface ConfirmationHeaderProps {
  orderReference: string
}

/**
 * The positive success message at the top of the Order Confirmation page: a
 * check icon, a reassuring headline, and the order reference for the completed
 * purchase.
 */
export default function ConfirmationHeader({ orderReference }: ConfirmationHeaderProps) {
  return (
    <div className="flex flex-col items-center gap-3 text-center" data-testid="confirmation-header">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-success">
        <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
      </span>
      <h1 className="text-2xl font-extrabold tracking-tight text-text">
        Thank you — your order is confirmed
      </h1>
      <p className="text-sm text-text-muted">
        A confirmation of your purchase is below. Order reference{' '}
        <span className="font-semibold text-text" data-testid="order-reference">
          {orderReference}
        </span>
        .
      </p>
    </div>
  )
}
