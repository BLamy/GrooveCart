# CheckoutButton

## Description

The primary call-to-action that starts payment. It appears in the `OrderSummary`
panel on the Cart page (`/cart`) and, in compact form, in the `CartDrawer` footer.
Clicking it hands the current cart off to Stripe: the button posts the cart's line
items to a GrooveCart server endpoint, which creates a Stripe Checkout session
(hosted, server-side) and returns the session's hosted-checkout URL; the browser is
then redirected to Stripe's hosted payment page. GrooveCart never collects card
details itself — Stripe owns the payment step. On success Stripe redirects to the
Order Confirmation page; on cancel it returns the shopper to the cart with items
intact.

The button is only meaningful for a non-empty cart. When the cart is empty it is
not shown at all (the `EmptyCartState` replaces the summary/drawer body), so there
is never an enabled Checkout button with nothing to buy.

## Interactions

- Click the `Checkout` button when the cart has at least one line item.

## Effects

- **Create session (server-side):** the click POSTs the current cart line items
  (record ids + quantities) to the checkout endpoint, which creates a Stripe
  Checkout session with the matching line items/amounts and success/cancel return
  URLs, and returns the session's hosted-checkout URL.
- **Redirect:** the browser is redirected to Stripe's hosted checkout URL.
- **Pending state:** while the session is being created, the button shows a
  pending/loading state and is disabled to prevent double submission.
- **Empty cart:** when the cart is empty the button is not rendered (and, if ever
  rendered with an empty cart, is disabled and does not create a session).
- **Error:** if session creation fails, the button returns to its idle state and an
  error message is shown; no redirect occurs.

### Testing note (vercel-labs/emulate)

Per the app spec, the Stripe checkout flow is stubbed in Playwright tests using
`vercel-labs/emulate`. Tests assert that clicking Checkout creates a Stripe
Checkout session (the server endpoint is called with the correct line items) and
that the app redirects to the (emulated) Stripe hosted checkout URL — no real
Stripe charge is performed. Tests should verify the redirect target / session
reference produced by the emulated Stripe rather than a live Stripe page.

## Dependencies

- Hosted by `OrderSummary` (Cart page) and the `CartDrawer` footer.
- Reads the current cart line items (record ids + quantities).
- Calls the server checkout endpoint that integrates with Stripe.
- Not rendered when the cart is empty (`EmptyCartState` is shown instead).
- Success redirect leads to the Order Confirmation page; cancel returns to `/cart`.

## Tests

* Test: Checkout creates a Stripe session and redirects (non-empty cart)
  - Initial state: On `/cart` with at least one record in the cart; the Stripe flow
    is stubbed via `vercel-labs/emulate`.
  - Action: Click the `Checkout` button.
  - Expected: The app POSTs the cart line items to the checkout endpoint, an
    (emulated) Stripe Checkout session is created with the matching line items, and
    the browser is redirected to the emulated Stripe hosted-checkout URL for that
    session. No real Stripe charge occurs.

* Test: Checkout sends the correct line items
  - Initial state: On `/cart` with two distinct records, one at quantity 2 and one
    at quantity 1; Stripe stubbed via `vercel-labs/emulate`.
  - Action: Click the `Checkout` button.
  - Expected: The created Stripe Checkout session contains line items matching the
    cart — the two records with quantities 2 and 1 and their unit prices — before
    the redirect to the emulated Stripe page.

* Test: Checkout button is pending and non-resubmittable during session creation
  - Initial state: On `/cart` with a non-empty cart; Stripe stubbed via
    `vercel-labs/emulate`.
  - Action: Click `Checkout` and observe the button before the redirect resolves.
  - Expected: The button enters a disabled/pending state so a second click cannot
    create a duplicate session; exactly one checkout session is created.

* Test: Checkout button is not available for an empty cart
  - Initial state: On `/cart` with an empty cart (the `EmptyCartState` is shown).
  - Action: Look for a `Checkout` button in the summary/drawer.
  - Expected: No enabled `Checkout` button is present — it is hidden/replaced by the
    `EmptyCartState`, so checkout cannot be initiated with nothing in the cart.

* Test: Checkout from the drawer also creates a session and redirects
  - Initial state: The `CartDrawer` is open with at least one line item; Stripe
    stubbed via `vercel-labs/emulate`.
  - Action: Click the drawer's `Checkout` CTA.
  - Expected: An emulated Stripe Checkout session is created from the cart and the
    browser is redirected to the emulated Stripe hosted-checkout URL, identical to
    checking out from the Cart page.

* Test: Cancelled Stripe checkout returns to the cart with items intact
  - Initial state: On `/cart` with a non-empty cart; Stripe stubbed via
    `vercel-labs/emulate` to simulate the shopper cancelling on the hosted page.
  - Action: Click `Checkout`, then trigger the emulated cancel/return path.
  - Expected: The shopper is returned to `/cart` with the same line items and
    quantities still present and the same totals — nothing was purchased or
    cleared.
