# OrderConfirmation

## Purpose

The post-purchase page reached after a successful Stripe payment. It reassures the
shopper that their purchase succeeded and summarizes exactly what they bought —
the purchased records, quantities, line totals, the order total, and an order
reference. Shoppers arrive here automatically via the Stripe success redirect at
the end of the `BuyASingleRecord`, `BuildAMultiRecordOrder`, and
`ReviewCompletedOrder` journeys. It is the final, positive step of the checkout
flow and the only place the customer sees their completed order summarized.

## Route

`/order/confirmation` — reached via the Stripe Checkout success redirect. The
Stripe session reference is carried on the URL as a query parameter
(`/order/confirmation?session_id={CHECKOUT_SESSION_ID}`). This session reference
is the key used to look up the recorded order from the database. If the
`session_id` is missing or does not resolve to a recorded order, the page shows a
not-found / "order being finalized" message rather than a blank page.

## Layout

A single, centered, focused column on the calm near-white storefront background —
no catalog tools or filters, so the confirmation reads clearly as the end of the
flow. The persistent `SiteHeader` (logo links home, cart button — now showing an
empty cart) remains at the top, and the `SiteFooter` remains at the bottom for
consistency across pages.

Within the centered column, from top to bottom:

- **ConfirmationHeader** — a positive success message (e.g. a check icon and
  "Thank you — your order is confirmed") together with the order reference/number
  for the completed order.
- **OrderSummaryList** — the list of purchased line items for the order, each
  showing the cover thumbnail, title, artist, quantity, unit price, and line
  total.
- **OrderTotals** — the total amount paid for the order, displayed prominently
  beneath the line-item list.
- **ContinueShoppingButton** — the primary CTA beneath the summary returning the
  shopper to the Storefront to keep browsing. See
  `docs/components/OrderConfirmation/ContinueShoppingButton.md`.

While the order is being looked up immediately after redirect, the
**ConfirmationLoadingState** replaces the summary area with a loading indicator
and a graceful message if the order is still being finalized server-side.

## Data

- On mount, the page reads the `session_id` query parameter and fetches the
  recorded order keyed by that Stripe session reference, e.g.
  `GET /api/orders/by-session/:sessionId`. The order record includes the order
  reference/number, status, total amount, created timestamp, and its line items
  (each with the record's title, artist, cover image, unit price, quantity, and
  computed line total).
- **Loading state:** while the fetch is in flight — or while the order is still
  being finalized server-side after the Stripe webhook/confirmation — the
  `ConfirmationLoadingState` is shown. The page may poll/retry briefly so that an
  order which is recorded a moment after redirect still resolves rather than
  showing an error.
- **Error / empty state:** if `session_id` is missing, or no order matches the
  session reference after retrying, the page shows a clear "We couldn't find that
  order" message with a link back to the Storefront, instead of an empty summary.
- **Side effect of arriving here:** reaching the confirmation page corresponds to
  a completed purchase — the cart is emptied for the session once the order is
  confirmed, so the `SiteHeader` cart count reads zero and returning to the
  Storefront shows an empty cart. Stock decrement and order recording happen
  server-side on successful payment confirmation; this page only reads and
  displays the already-recorded order.
