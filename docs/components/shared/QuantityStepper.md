# QuantityStepper

## Description

A reusable increment/decrement quantity control. It renders a "−" (decrement)
button, the current quantity value, and a "+" (increment) button. It is used in
two places:

- On the `RecordDetail` page, to choose how many copies of the record to add to
  the cart (before pressing `AddToCartButton`).
- In the `Cart` (both the `CartDrawer` and the full Cart page, on each
  `CartLineItem`), to adjust the quantity of a line item already in the cart.

The displayed quantity is **floored at 1** and **capped at the available
stock**. The cap accounts for stock already committed:

- On `RecordDetail`, the maximum selectable quantity is
  `stock − (quantity of this record already in the cart)`.
- On a `CartLineItem`, the maximum is the record's `stock` (the line's own
  quantity is what's being edited).

When the value is at the cap, the **"+" (increment) button is disabled**. When
the value is at 1, the **"−" (decrement) button is disabled** (floor of 1; the
Cart provides a separate remove action to drop a line entirely). If the cap is
0 (e.g. a sold-out record on the detail page, or all stock already in the cart),
the stepper is disabled entirely.

## Interactions

- Click **"+"** to increment the displayed quantity by 1.
- Click **"−"** to decrement the displayed quantity by 1.

## Effects

- Clicking "+" increases the displayed quantity by 1, up to the cap. At the cap,
  the "+" button is disabled and clicking it has no effect.
- Clicking "−" decreases the displayed quantity by 1, down to the floor of 1. At
  1, the "−" button is disabled and clicking it has no effect.
- On `RecordDetail`, the chosen quantity is the amount `AddToCartButton` will add
  to the cart.
- On a `CartLineItem`, changing the quantity immediately updates that line's
  quantity, its per-line total, and the cart's subtotal/order total (and the
  header cart count).

## Dependencies

- Used by `RecordDetail` (alongside `AddToCartButton`) and by `CartLineItem`
  inside `CartDrawer` and the Cart page.
- Bounds are derived from the record's `stock` and (on RecordDetail) the
  quantity of that record already present in the shared session cart.

> Note: stock counts referenced below must be derived from the actual
> `seed-db.ts` values. Tests should select records by a stable identifier and a
> known stock level rather than by API return order.

## Tests

* Test: Increment increases the displayed quantity
  - Initial state: On the RecordDetail page for an in-stock record (`stock` > 5),
    cart empty for this record; the stepper shows 1.
  - Action: Click "+".
  - Expected: The displayed quantity updates to 2.

* Test: Decrement decreases the displayed quantity
  - Initial state: On the RecordDetail page for an in-stock record, with the
    stepper showing 3 (after two increments).
  - Action: Click "−".
  - Expected: The displayed quantity updates to 2.

* Test: Quantity is floored at 1 and decrement is disabled at the floor
  - Initial state: On the RecordDetail page for an in-stock record; the stepper
    shows 1.
  - Action: Observe the "−" button and attempt to click it.
  - Expected: The "−" button is disabled; the displayed quantity stays at 1 and
    never goes to 0 or negative.

* Test: Increment is capped at available stock and disabled at the cap
  - Initial state: On the RecordDetail page for a low-stock record whose seeded
    `stock` is a small number `N` (e.g. 2), cart empty for this record; stepper
    shows 1.
  - Action: Click "+" repeatedly until the quantity reaches `N`.
  - Expected: The quantity increases to `N` and stops there; the "+" button is
    disabled at `N` and further clicks do not increase the value beyond `N`.

* Test: Cap accounts for quantity already in the cart
  - Initial state: A low-stock record with seeded `stock` of `N` (e.g. 3) where
    1 copy is already in the cart. The shopper is on that record's RecordDetail
    page.
  - Action: Increment the stepper as far as it will go.
  - Expected: The stepper caps at `N − 1` (e.g. 2) — the remaining purchasable
    quantity — and the "+" button is disabled at that cap, so adding to cart can
    never exceed the record's total stock.

* Test: Stepper updates a cart line item's quantity and totals
  - Initial state: The cart (CartDrawer or Cart page) contains a line item for
    an in-stock record at quantity 1, with `stock` > 5.
  - Action: Click "+" on that line item's QuantityStepper.
  - Expected: The line quantity becomes 2, the per-line total doubles (2 × unit
    price), and the cart subtotal/order total and header cart count update
    accordingly.

* Test: Cart line stepper increment is capped at the record's stock
  - Initial state: A cart line item for a low-stock record whose seeded `stock`
    is `N` (e.g. 2), with the line quantity already at `N`.
  - Action: Observe and attempt to click "+".
  - Expected: The "+" button is disabled; the line quantity cannot exceed the
    record's stock `N`.
