# ContinueShoppingButton

## Description

The primary call-to-action on the Order Confirmation page
(`docs/pages/OrderConfirmation.md`), shown beneath the order summary once the
completed order has loaded. It invites the shopper to return to the Storefront and
keep browsing after a successful purchase. Labeled "Continue Shopping" and styled
as the prominent accent-colored primary button on the confirmation surface.

## Interactions

- The user clicks the "Continue Shopping" button.

## Effects

- **Navigation:** navigates to the Storefront catalog at `/`.
- **State:** by the time the shopper reaches the confirmation page the purchase is
  complete and the cart has been emptied for the session, so on returning to the
  Storefront the `SiteHeader` cart button shows an item count of 0 and opening the
  `CartDrawer` shows the empty-cart state — the just-purchased records are no
  longer in the cart.

## Dependencies

- Lives on the Order Confirmation page; rendered after the order is successfully
  looked up from the Stripe session reference (i.e. after
  `ConfirmationLoadingState` resolves).
- Navigates to the Storefront (Catalog) page and relies on the cart having been
  cleared after the completed purchase, which is reflected in the `SiteHeader`
  cart count and `CartDrawer` there.

## Tests

* Test: Continue Shopping returns to the storefront with an emptied cart
  - Initial state: A purchase has been completed via the (emulated) Stripe
    checkout flow and the shopper has been redirected to the Order Confirmation
    page (`/order/confirmation?session_id={session}`); the order summary has
    loaded and the "Continue Shopping" button is visible. The cart was emptied as
    part of completing the purchase.
  - Action: The user clicks the "Continue Shopping" button.
  - Expected: The app navigates to the Storefront at `/` showing the record
    catalog grid. The `SiteHeader` cart button shows an item count of 0, and
    opening the `CartDrawer` shows the empty-cart state (no line items) — the
    records purchased in the completed order are not present in the cart.
  - File: (to be filled in when the test is implemented)
