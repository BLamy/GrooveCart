import { Link } from 'react-router-dom'

/**
 * The primary call-to-action on the Order Confirmation page: returns the shopper
 * to the Storefront to keep browsing after a successful purchase. By the time it
 * is shown the cart has been emptied for the session, so the Storefront's cart
 * count reads zero.
 */
export default function ContinueShoppingButton() {
  return (
    <Link
      to="/"
      data-testid="continue-shopping"
      className="inline-flex w-full items-center justify-center rounded-control bg-accent px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
    >
      Continue Shopping
    </Link>
  )
}
