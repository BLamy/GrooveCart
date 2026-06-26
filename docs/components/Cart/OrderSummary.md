# OrderSummary

## Description

The sticky summary panel on the right column of the Cart page (`/cart`). It rolls
up the cart's line items into a clear set of totals — a per-line roll-up, the
subtotal, and the order total — and hosts the primary `CheckoutButton`. As the
line-item list scrolls, the panel stays pinned (sticky) so the totals and the
Checkout action remain visible. A compact variant of the same summary appears in
the `CartDrawer` footer.

All totals are computed on the client from the cart's line items: each line total
is `unit price × quantity`, the subtotal is the sum of all line totals, and the
order total equals the subtotal (GrooveCart hands shipping/tax collection to
Stripe's hosted checkout, so the order total shown here is the records subtotal).

## Interactions

- The panel itself is primarily a display surface; its one interactive element is
  the `CheckoutButton` (documented separately).
- It reacts automatically to changes made in `CartLineItem` rows (quantity changes
  and removals).

## Effects

- **Totals display:** shows each line's roll-up (record × quantity → line total),
  the subtotal (sum of line totals), and the order total. Values are formatted as
  currency.
- **Recompute on change:** whenever a line item's quantity changes or a line is
  removed, the subtotal and order total recompute immediately to match the current
  line items.
- **Checkout:** the embedded `CheckoutButton` initiates the Stripe Checkout
  session for the current cart (see `CheckoutButton`).
- **Sticky behavior:** the panel remains visible while the line-item list scrolls.

## Dependencies

- Computes totals from `CartLineItem` line totals.
- Hosts the `CheckoutButton`.
- Compact form mirrored in `CartDrawer`.
- Not shown when the cart is empty (the `EmptyCartState` replaces the whole
  two-column layout).

## Tests

* Test: Subtotal equals the sum of line totals
  - Initial state: On `/cart` with two distinct records in the cart, each at
    quantity 1 (e.g. unit prices $24.00 and $30.00 → line totals $24.00 and
    $30.00).
  - Action: Observe the `OrderSummary`.
  - Expected: The subtotal equals the sum of the two line totals ($54.00) and the
    order total equals the subtotal ($54.00). Each line's roll-up shows the record
    and its quantity → line total.

* Test: Line total reflects unit price times quantity
  - Initial state: On `/cart` with one record at quantity 3 (unit price $24.00).
  - Action: Observe the `OrderSummary` roll-up for that line.
  - Expected: The line roll-up shows quantity 3 and a line total of $72.00, and the
    subtotal/order total equal $72.00.

* Test: Totals recompute after a quantity increase
  - Initial state: On `/cart` with a single line item at quantity 1 and the
    `OrderSummary` showing the matching subtotal/order total.
  - Action: Increment that line item's quantity to 2 via its `QuantityStepper`.
  - Expected: The `OrderSummary` subtotal and order total recompute to `unit price
    × 2` for the single-line cart (the displayed totals double).

* Test: Totals recompute after a quantity decrease
  - Initial state: On `/cart` with a single line item at quantity 3.
  - Action: Decrement the line item's quantity to 2.
  - Expected: The subtotal and order total recompute downward to `unit price × 2`.

* Test: Totals recompute after removing a line item
  - Initial state: On `/cart` with two distinct records in the cart; the
    `OrderSummary` subtotal equals the sum of both line totals.
  - Action: Remove one of the two line items.
  - Expected: The subtotal and order total recompute to equal only the remaining
    line's total, and the removed line's roll-up no longer appears in the summary.

* Test: Order total matches subtotal across multiple edits
  - Initial state: On `/cart` with two distinct records, each at quantity 1.
  - Action: Increment the first line to quantity 2, then remove the second line.
  - Expected: After each edit the subtotal and order total stay equal to each other
    and to the sum of the current line totals (after the edits: only the first
    record remains at quantity 2, so subtotal = order total = `firstUnitPrice × 2`).
