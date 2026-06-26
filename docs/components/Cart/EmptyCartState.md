# EmptyCartState

## Description

The empty state shown wherever the cart is rendered but holds no line items — both
on the full Cart page (`/cart`, replacing the two-column layout) and inside the
`CartDrawer` (replacing the line-item list). It reassures the shopper their cart is
simply empty (not broken) with a friendly message and a single primary
`Browse Records` button that returns them to the Storefront to keep shopping.
Modeled on the DailyArt empty-cart-recovery reference.

## Interactions

- Click the `Browse Records` button.

## Effects

- **Navigation:** clicking `Browse Records` navigates to the Storefront `/`. When
  shown inside the `CartDrawer`, clicking it also closes the drawer as it navigates.
- **Display:** shows a friendly empty message (e.g. "Your cart is empty") and no
  line items, totals, or `CheckoutButton`.

## Dependencies

- Shown by the Cart page and the `CartDrawer` when the cart has zero line items.
- `Browse Records` navigates to the Storefront (`/`).
- Replaced by the line-item list + `OrderSummary` as soon as the cart has items.

## Tests

* Test: Empty cart page shows the empty state
  - Initial state: The cart has no line items.
  - Action: Navigate to `/cart`.
  - Expected: The `EmptyCartState` is shown with a friendly empty-cart message and a
    `Browse Records` button; no `CartLineItem` rows, no `OrderSummary`, and no
    `CheckoutButton` are present.

* Test: Browse Records navigates to the storefront
  - Initial state: On `/cart` with an empty cart, so the `EmptyCartState` is shown.
  - Action: Click the `Browse Records` button.
  - Expected: The app navigates to the Storefront `/` and the catalog grid is
    displayed.

* Test: Empty state replaces line items after removing everything
  - Initial state: On `/cart` with exactly one line item.
  - Action: Remove that line item via its remove action.
  - Expected: The two-column line-item/summary layout is replaced by the
    `EmptyCartState` with its `Browse Records` button.

* Test: Empty state appears in the drawer when the cart is empty
  - Initial state: The cart is empty.
  - Action: Open the `CartDrawer` from the `SiteHeader` cart button.
  - Expected: The drawer shows the `EmptyCartState` (message + `Browse Records`)
    instead of any line items or `Checkout` CTA.

* Test: Browse Records from the drawer empty state returns to the storefront
  - Initial state: The `CartDrawer` is open with an empty cart, showing the
    `EmptyCartState`.
  - Action: Click the `Browse Records` button inside the drawer.
  - Expected: The app navigates to the Storefront `/` and the drawer closes.
