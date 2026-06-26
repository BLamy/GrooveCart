# CartLineItem

## Description

A single row representing one record in the cart. It appears in both the full Cart
page (`/cart`) line-item list and, in a compact form, inside the `CartDrawer`. Each
row shows the record's cover thumbnail, title, artist, unit price, a
`QuantityStepper` (bounded by the record's available stock), the per-line total
(`unit price × quantity`), and a remove action.

## Interactions

- Use the `QuantityStepper` to increment or decrement the line's quantity. The
  stepper is bounded: it cannot go below 1 and cannot exceed the record's available
  stock.
- Click the remove (trash/×) action to delete the line item from the cart.
- Click the cover thumbnail or title to open that record's Record Detail page
  (`/records/:id`).

## Effects

- **Quantity change:** updates the line item's quantity in the persisted cart
  state, recomputes and re-renders this row's per-line total, and triggers the
  `OrderSummary` (and the `CartDrawer` compact summary) to recompute the subtotal
  and order total. The `SiteHeader` cart count updates accordingly. The change
  persists across navigation within the session.
- **Decrement at minimum / increment at max:** at quantity 1 the decrement control
  is disabled (removal is done via the remove action, not by stepping below 1); at
  the available-stock cap the increment control is disabled so the quantity can
  never exceed stock.
- **Remove:** deletes the line item from the cart state; the row disappears from
  the list, totals recompute, the cart count decreases, and the
  `RemovedItemBanner` appears showing the removed record's name. Removing the last
  line item reveals the `EmptyCartState`.
- **Thumbnail/title click:** navigates to the record's detail page.

## Dependencies

- Reuses the shared `QuantityStepper` control (bounded by stock).
- Feeds totals consumed by `OrderSummary` and the `CartDrawer` summary.
- Triggers `RemovedItemBanner` on removal.
- Removing the last item surfaces `EmptyCartState`.
- Rendered by the Cart page and the `CartDrawer`.

## Tests

* Test: Increasing quantity updates the per-line total
  - Initial state: On `/cart` with one record in the cart at quantity 1 (unit price
    read from the record, e.g. $24.00 → per-line total $24.00).
  - Action: Click the `QuantityStepper` increment control once.
  - Expected: The line quantity becomes 2 and the per-line total updates to
    `unit price × 2` (e.g. $48.00).

* Test: Changing quantity updates the order totals
  - Initial state: On `/cart` with a single line item at quantity 1; the
    `OrderSummary` subtotal and order total equal that line's total.
  - Action: Increment the line item's quantity to 2.
  - Expected: The `OrderSummary` subtotal and order total recompute to reflect the
    new per-line total (e.g. they double for a single-line cart).

* Test: Quantity change persists across navigation
  - Initial state: On `/cart` with a line item at quantity 1.
  - Action: Increment the quantity to 3, navigate to the Storefront `/`, then
    navigate back to `/cart`.
  - Expected: The line item still shows quantity 3 with the matching per-line
    total, and the `OrderSummary` totals reflect quantity 3 — the change survived
    navigation within the session.

* Test: Decrementing quantity updates totals
  - Initial state: On `/cart` with a line item at quantity 3.
  - Action: Click the `QuantityStepper` decrement control once.
  - Expected: The quantity becomes 2, the per-line total recomputes, and the
    `OrderSummary` subtotal/order total decrease accordingly.

* Test: Decrement is disabled at quantity 1
  - Initial state: On `/cart` with a line item at quantity 1.
  - Action: Observe the `QuantityStepper` decrement control.
  - Expected: The decrement control is disabled; the quantity cannot be stepped
    below 1 (removal is done via the remove action).

* Test: Increment is capped at available stock
  - Initial state: On `/cart` with a line item whose record has limited stock
    (e.g. only 2 in stock) and the line quantity already at that stock cap (2).
  - Action: Attempt to click the `QuantityStepper` increment control.
  - Expected: The increment control is disabled and the quantity stays at the stock
    cap; the line total does not increase beyond `unit price × stock`.

* Test: Remove deletes the line and shows the removed-item banner
  - Initial state: On `/cart` with two distinct records in the cart.
  - Action: Click the remove action on the first line item.
  - Expected: That line item disappears from the list, the remaining line item
    stays, the `OrderSummary` totals recompute to exclude the removed line, the
    cart count decreases, and the `RemovedItemBanner` appears showing the removed
    record's name.

* Test: Removing the last line item shows the empty cart state
  - Initial state: On `/cart` with exactly one line item.
  - Action: Click that line item's remove action.
  - Expected: The line-item list and `OrderSummary` are replaced by the
    `EmptyCartState`, and the `RemovedItemBanner` confirms the removed record's
    name.

* Test: Clicking the thumbnail opens the record detail page
  - Initial state: On `/cart` with at least one line item.
  - Action: Click the line item's cover thumbnail (or title).
  - Expected: The app navigates to that record's detail page (`/records/:id`)
    showing the matching record.
