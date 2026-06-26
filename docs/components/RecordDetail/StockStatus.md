# StockStatus

## Description

An availability indicator shown inside the `PriceBlock` on the `RecordDetail`
page (and reusable wherever a record's availability is surfaced). It derives a
label and styling from the record's `stock` quantity:

- **`stock === 0`** → "Sold out" (muted/red styling).
- **`1 <= stock <= 5`** (low-stock threshold = 5) → "Only N left", where `N` is
  the exact remaining stock (e.g. "Only 2 left"), shown in a warning/amber
  styling.
- **`stock > 5`** → "In stock" (positive/green styling).

The indicator is also a **hover target**: hovering it reveals a tooltip with
more informative detail about availability (the exact number of copies in stock
and a short explanation), so the shopper understands the signal.

It is a status indicator rather than a control; it does not mutate data, but it
both reflects stock and drives whether the purchase controls (`QuantityStepper`,
`AddToCartButton`) are enabled.

## Interactions

- **Hover** over the StockStatus indicator to reveal its tooltip/popover with
  detailed availability information.
- No click interaction — it is a non-mutating status indicator.

## Effects

- On hover, a tooltip appears with informative detail, e.g. "12 copies in stock"
  for an in-stock record, "Only 2 copies remaining — order soon" for a low-stock
  record, or "Currently sold out — check back later" for a sold-out record.
- The label/state it computes governs sibling purchase controls: when "Sold
  out", the `AddToCartButton` is disabled/labeled "Sold Out" and the
  `QuantityStepper` is disabled; otherwise they are enabled and bounded by the
  remaining stock.

## Dependencies

- Rendered within `PriceBlock` on the `RecordDetail` page.
- Reads the record's `stock` value fetched by the page.
- Coordinates with `QuantityStepper` and `AddToCartButton`, which key their
  enabled state off the same stock value.

> Note: the specific records and stock counts referenced below must be derived
> from the actual `seed-db.ts` values once the catalog is seeded. The seed must
> include at least one record at each stock level (in stock > 5, low stock
> between 1 and 5, and sold out at 0). Tests should select records by a stable
> identifier (title/artist), not by API return order.

## Tests

* Test: Shows "In stock" for a well-stocked record
  - Initial state: On the RecordDetail page for a seeded record whose `stock`
    is greater than 5 (selected by its stable title/artist).
  - Action: Observe the StockStatus indicator in the PriceBlock.
  - Expected: The indicator reads "In stock" with positive (green) styling. The
    `AddToCartButton` is enabled and the `QuantityStepper` increment is usable.

* Test: Shows "Only N left" for a low-stock record
  - Initial state: On the RecordDetail page for a seeded record whose `stock`
    is between 1 and 5 inclusive (selected by stable identifier); let its seeded
    stock be `N`.
  - Action: Observe the StockStatus indicator.
  - Expected: The indicator reads "Only N left" where `N` exactly matches the
    record's seeded stock (e.g. "Only 2 left"), with warning (amber) styling.

* Test: Shows "Sold out" for an out-of-stock record
  - Initial state: On the RecordDetail page for a seeded record whose `stock`
    is 0 (selected by stable identifier).
  - Action: Observe the StockStatus indicator.
  - Expected: The indicator reads "Sold out" with muted/red styling. The
    `AddToCartButton` is disabled and labeled "Sold Out".

* Test: Hovering the indicator reveals detailed availability (in stock)
  - Initial state: On the RecordDetail page for an in-stock record (`stock` > 5)
    with the StockStatus indicator visible.
  - Action: Hover the pointer over the StockStatus indicator.
  - Expected: A tooltip/popover appears showing the exact number of copies in
    stock (e.g. "12 copies in stock") with an informative message; the count
    matches the record's seeded stock.

* Test: Hovering the indicator reveals detailed availability (low stock)
  - Initial state: On the RecordDetail page for a low-stock record
    (1 ≤ `stock` ≤ 5).
  - Action: Hover over the StockStatus indicator.
  - Expected: The tooltip reveals the exact remaining count and an urgency hint
    (e.g. "Only 2 copies remaining — order soon"), the count matching the seeded
    stock.

* Test: Hovering the indicator reveals detailed availability (sold out)
  - Initial state: On the RecordDetail page for a sold-out record (`stock` = 0).
  - Action: Hover over the StockStatus indicator.
  - Expected: The tooltip reveals a sold-out explanation (e.g. "Currently sold
    out — check back later").
