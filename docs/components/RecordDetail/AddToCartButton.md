# AddToCartButton

## Description

The primary call-to-action in the purchase panel of the `RecordDetail` page. It
adds the quantity currently selected in the `QuantityStepper` to the shopping
cart. When the record is purchasable it is labeled **"Add to Cart"**; when the
record is out of stock — or when the cart already holds all of the record's
available stock — it is **disabled and labeled "Sold Out"**.

## Interactions

- Click the **"Add to Cart"** button to add the selected quantity of the record
  to the cart.
- When disabled (labeled "Sold Out"), the button cannot be clicked and produces
  no change.

## Effects

On a successful click (record purchasable):

- The selected quantity is added to the session cart. If the record is already
  in the cart, its line quantity increases by the selected amount (never
  exceeding the record's total `stock`).
- The `CartDrawer` opens and animates in (slides into view) showing the updated
  cart contents.
- The `SiteHeader` cart button's item count updates to reflect the newly added
  quantity.
- The cart subtotal / order total reflect the addition, and the cart's persisted
  session state is updated.
- Because adding may consume the remaining stock, the `QuantityStepper` cap and
  this button's enabled state are recomputed (e.g. if the cart now holds all
  available stock, the button becomes disabled and labeled "Sold Out").

When disabled (out of stock, or cart already holds all available stock):

- The button shows "Sold Out", is non-interactive, and clicking it does nothing.

## Dependencies

- Lives on the `RecordDetail` page next to the `QuantityStepper`, whose value it
  reads as the quantity to add.
- Its enabled/disabled state is driven by `StockStatus` (record `stock`) and the
  quantity of this record already in the cart.
- Opens and updates the `CartDrawer`; updates the `SiteHeader` cart count.

> Note: stock counts referenced below must be derived from
> `public/data/records.json`. Tests should select records by a stable identifier
> and a known stock level rather than by return order.

## Tests

* Test: Clicking adds the selected quantity to the cart
  - Initial state: On the RecordDetail page for an in-stock record (`stock` > 5),
    cart empty, with the `QuantityStepper` incremented to 2.
  - Action: Click the "Add to Cart" button.
  - Expected: A cart line for this record is created with quantity 2; the line's
    record (title/artist) and unit price match the record on the page.

* Test: Clicking opens and animates the CartDrawer
  - Initial state: On the RecordDetail page for an in-stock record, CartDrawer
    closed.
  - Action: Click "Add to Cart".
  - Expected: The CartDrawer slides into view (open/animated) and lists the
    just-added record with the chosen quantity.

* Test: Clicking updates the header cart count
  - Initial state: On the RecordDetail page for an in-stock record, header cart
    count showing 0, stepper set to 3.
  - Action: Click "Add to Cart".
  - Expected: The SiteHeader cart button count increases to 3 (matching the
    quantity added) and persists across navigation.

* Test: Button is disabled and labeled "Sold Out" for an out-of-stock record
  - Initial state: On the RecordDetail page for a seeded record whose `stock`
    is 0.
  - Action: Observe the button and attempt to click it.
  - Expected: The button reads "Sold Out", is disabled, and clicking it adds
    nothing to the cart (cart count unchanged, CartDrawer does not open).

* Test: Button becomes "Sold Out" when the cart already holds all available stock
  - Initial state: A low-stock record with seeded `stock` of `N` (e.g. 2), and
    the cart already contains all `N` copies of it. The shopper is on that
    record's RecordDetail page.
  - Action: Observe the AddToCartButton.
  - Expected: The button is disabled and labeled "Sold Out" (and the
    `QuantityStepper` is disabled), because the remaining purchasable quantity is
    0 — preventing the cart from ever exceeding the record's total stock.
