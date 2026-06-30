import { useState } from 'react'
import { Loader2, Lock } from 'lucide-react'
import { createCheckoutSession, type CheckoutLineInput } from '../../api/checkout'

interface CheckoutButtonProps {
  /** The cart line items (record id + quantity) to hand off to Stripe. */
  items: CheckoutLineInput[]
  /** Optional label override (defaults to "Checkout"). */
  label?: string
}

/**
 * Primary call-to-action that starts payment. It POSTs the cart to the checkout
 * endpoint (which creates a Stripe Checkout session) and redirects the browser
 * to Stripe's hosted page. It is disabled and shows a pending state while the
 * session is being created so a second click can't create a duplicate session.
 * Rendered only for a non-empty cart.
 */
export default function CheckoutButton({ items, label = 'Checkout' }: CheckoutButtonProps) {
  const [pending, setPending] = useState(false)
  const [customerEmail, setCustomerEmail] = useState('')
  const [error, setError] = useState<string | null>(null)

  const empty = items.length === 0

  async function onCheckout() {
    if (pending || empty) return
    const email = customerEmail.trim()
    if (!email || !email.includes('@')) {
      setError('Enter an email address for your receipt.')
      return
    }
    setPending(true)
    setError(null)
    try {
      const url = await createCheckoutSession(items, email)
      // Hand off to Stripe's hosted checkout. Keep `pending` true: the page is
      // navigating away, so the button stays disabled until then.
      window.location.href = url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed')
      setPending(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="flex flex-col gap-1 text-sm font-semibold text-[var(--gc-text)]">
        Receipt email
        <input
          type="email"
          data-testid="checkout-email-input"
          autoComplete="email"
          inputMode="email"
          placeholder="listener@example.com"
          value={customerEmail}
          onChange={(event) => {
            setCustomerEmail(event.target.value)
            if (error) setError(null)
          }}
          className="rounded-[var(--gc-radius-control)] border border-[var(--gc-border)] bg-white px-3 py-2 font-normal text-[var(--gc-text)] outline-none transition-colors placeholder:text-[var(--gc-text-muted)] focus:border-[var(--gc-accent)]"
        />
      </label>
      <button
        type="button"
        data-testid="checkout-button"
        onClick={onCheckout}
        disabled={pending || empty}
        className="inline-flex w-full items-center justify-center gap-2 rounded-[var(--gc-radius-control)] bg-[var(--gc-accent)] px-5 py-3 font-semibold text-white transition-colors hover:bg-[var(--gc-accent-hover)] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Redirecting…
          </>
        ) : (
          <>
            <Lock size={16} />
            {label}
          </>
        )}
      </button>
      {error && (
        <p role="alert" className="text-sm text-[var(--gc-accent)]">
          {error}
        </p>
      )}
    </div>
  )
}
