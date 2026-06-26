# CartDrawer

## Description

A slide-in panel that gives the shopper quick access to their cart from any page.
It is opened by clicking the cart button in the `SiteHeader` (which shows the live
item count) and slides in from the right over the current page, dimming the page
behind it with an overlay/scrim. The drawer lists the current cart line items in a
compact form along with a small summary, and provides a primary `Checkout` CTA and
a secondary `View Cart` link to the full `/cart` page. When the cart has no items,
the drawer shows the `EmptyCartState` instead of a line-item list.

The drawer and the full Cart page read from the same session-persisted cart state,
so they always show the same items and totals.

## Interactions

- Click the `SiteHeader` cart button → the drawer slides open.
- Click the close (×) button, click the overlay/scrim outside the panel, or press
  `Escape` → the drawer slides closed.
- Within the drawer, each line item exposes its `QuantityStepper` and remove
  action (see `CartLineItem`); the compact summary updates as quantities change.
- Click `View Cart` → navigates to `/cart` and closes the drawer.
- Click `Checkout` → initiates Stripe Checkout (see `CheckoutButton`).
- When empty, click `Browse Records` in the embedded `EmptyCartState` → navigates
  to the Storefront `/`.

## Effects

- **Open/close:** opening sets the drawer to a visible/expanded state and traps
  focus within it; closing returns the page to its normal state and restores focus
  to the cart button. The underlying page does not navigate when opening/closing.
- **Item count:** the cart button's badge reflects the total quantity across line
  items and updates live as items are added/removed.
- **Navigation:** `View Cart` pushes `/cart`; the embedded empty-state button
  pushes `/`.
- **Summary:** a compact subtotal/order-total reflects the current line items and
  recomputes on any quantity/remove change.

## Dependencies

- Opened from the `SiteHeader` cart button.
- Renders `CartLineItem` rows (each with a `QuantityStepper` and remove action).
- Renders a compact summary; the full panel version is `OrderSummary` on `/cart`.
- Renders `EmptyCartState` when the cart is empty.
- Hosts the `CheckoutButton` (Checkout CTA).
- `View Cart` link navigates to the Cart page (`/cart`).

## Tests

* Test: Cart button opens the drawer
  - Initial state: On the Storefront `/` with at least one record in the cart; the
    drawer is closed.
  - Action: Click the cart button in the `SiteHeader`.
  - Expected: The `CartDrawer` slides in and becomes visible, showing the current
    line items and a compact summary. The page behind is overlaid by a scrim and
    does not navigate (URL stays `/`).

* Test: Close button closes the drawer
  - Initial state: The `CartDrawer` is open with at least one line item.
  - Action: Click the drawer's close (×) button.
  - Expected: The drawer slides closed and is no longer visible; the URL is
    unchanged and the page content behind is interactive again.

* Test: Clicking the overlay closes the drawer
  - Initial state: The `CartDrawer` is open.
  - Action: Click the dimmed overlay/scrim outside the drawer panel.
  - Expected: The drawer closes and is no longer visible.

* Test: Escape key closes the drawer
  - Initial state: The `CartDrawer` is open and focused.
  - Action: Press the `Escape` key.
  - Expected: The drawer closes and is no longer visible; focus returns to the
    `SiteHeader` cart button.

* Test: View Cart navigates to the full cart page
  - Initial state: The `CartDrawer` is open with at least one line item.
  - Action: Click the `View Cart` link.
  - Expected: The app navigates to `/cart`, the drawer closes, and the full
    two-column Cart page is shown with the same line items that were in the drawer.

* Test: Drawer shows the empty state when the cart has no items
  - Initial state: The cart is empty (no line items).
  - Action: Click the `SiteHeader` cart button to open the drawer.
  - Expected: The drawer opens and shows the `EmptyCartState` (friendly message and
    a `Browse Records` button) instead of any line items or a `Checkout` CTA.

* Test: Browse Records from the empty drawer returns to the storefront
  - Initial state: The `CartDrawer` is open and the cart is empty, so the
    `EmptyCartState` is shown.
  - Action: Click the `Browse Records` button inside the drawer.
  - Expected: The app navigates to the Storefront `/` and the drawer closes.

* Test: Drawer reflects items added without a page reload
  - Initial state: On a Record Detail page with the cart empty and the drawer
    closed.
  - Action: Add the record to the cart (via the detail page's Add to Cart), then
    open the drawer.
  - Expected: The cart button count increments and the drawer lists the newly
    added record with the correct quantity and a compact summary reflecting it.

* Test: Checkout CTA is present for a non-empty cart
  - Initial state: The `CartDrawer` is open with at least one line item.
  - Action: Observe the drawer footer.
  - Expected: A primary `Checkout` button is visible and enabled (its behavior is
    covered by `CheckoutButton` tests).
