/** The line items posted to the checkout endpoint: a record id and a quantity. */
export interface CheckoutLineInput {
  recordId: number
  quantity: number
}

/**
 * POST the current cart to the GrooveCart checkout endpoint, which creates a
 * Stripe Checkout session server-side and returns its hosted-checkout URL. The
 * caller redirects the browser to that URL. Throws with a readable message on
 * failure so the `CheckoutButton` can return to idle and surface an error.
 */
export async function createCheckoutSession(items: CheckoutLineInput[], customerEmail: string): Promise<string> {
  const res = await fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items, customerEmail }),
  })

  if (!res.ok) {
    let message = `Checkout failed (${res.status})`
    try {
      const data = (await res.json()) as { error?: string }
      if (data?.error) message = data.error
    } catch {
      // response had no JSON body; keep the status-based message
    }
    throw new Error(message)
  }

  const data = (await res.json()) as { url?: string }
  if (!data?.url) {
    throw new Error('Checkout session did not return a redirect URL')
  }
  return data.url
}
