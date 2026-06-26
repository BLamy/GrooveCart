# RecordCard

## Description

A catalog tile in the RecordGrid representing a single record. It shows the
square cover image, title, artist, a genre tag, the price, and a stock signal.
The whole card is clickable to open the record's detail page. In-stock cards
include a quick "Add to Cart" affordance; out-of-stock cards show a muted "Sold
Out" badge with the add action disabled.

## Interactions

- Click the card body (cover/title area) to open the Record Detail page.
- Click the quick "Add to Cart" button (in-stock cards only).
- (Out-of-stock cards) the "Add to Cart" affordance is disabled; the "Sold Out"
  badge is shown.

## Effects

- Clicking the card: navigates to the Record Detail page at `/records/:id` for
  that record.
- Clicking quick "Add to Cart" (in stock): adds one of that record to the cart,
  increments the SiteHeader CartButton badge, and shows gentle feedback (e.g. a
  toast / the cart count animating). Does not navigate away.
- Out-of-stock card: displays the "Sold Out" badge; the quick add button is
  disabled (visibly inert) and clicking it does nothing / cannot be clicked.

## Dependencies

- Rendered by [RecordGrid](RecordGrid.md).
- Navigates to the Record Detail page (`/records/:id`).
- Quick add updates the [CartButton](../navigation/CartButton.md) count.

## Tests

* Test: Card displays record summary fields
  - Initial state: Storefront `/` loaded with the seeded catalog.
  - Action: Locate the "Kind of Blue" RecordCard.
  - Expected: The card shows the title "Kind of Blue", artist "Miles Davis", a
    "Jazz" genre tag, the price "$34.99", and an in-stock signal (purchasable).

* Test: Clicking a card opens the Record Detail page
  - Initial state: Storefront `/` with the seeded catalog visible.
  - Action: Click the "Kind of Blue" RecordCard body.
  - Expected: The app navigates to that record's detail page (`/records/:id`); the
    Record Detail page renders "Kind of Blue" by Miles Davis with its price and
    description.

* Test: Quick Add to Cart on an in-stock card adds the record
  - Initial state: Storefront `/` with an empty cart (CartButton badge empty); the
    "Rumours" card is in stock (8 available).
  - Action: Click the quick "Add to Cart" button on the "Rumours" card.
  - Expected: One "Rumours" is added to the cart; the CartButton badge updates to
    "1"; the page stays on `/` (no navigation). Opening the CartDrawer shows
    "Rumours" as a line item.

* Test: Quick add increments the cart on repeated use
  - Initial state: Storefront `/`; cart already contains 1 "Rumours" (badge "1").
  - Action: Click quick "Add to Cart" on the "Nevermind" card.
  - Expected: The CartButton badge updates to "2"; the cart now contains both
    "Rumours" and "Nevermind".

* Test: Out-of-stock card shows Sold Out with a disabled add action
  - Initial state: Storefront `/` with the seeded catalog; "Discovery" by Daft
    Punk has stock 0.
  - Action: Locate the "Discovery" RecordCard and attempt to use its add action.
  - Expected: The card shows a "Sold Out" badge and is visually muted; the "Add
    to Cart" affordance is disabled (cannot be clicked) and the cart count does
    not change.

* Test: Clicking an out-of-stock card still opens its detail page
  - Initial state: Storefront `/` with the "Songs in the Key of Life" card (stock
    0) visible.
  - Action: Click the "Songs in the Key of Life" card body.
  - Expected: The app navigates to that record's detail page (`/records/:id`),
    which shows the sold-out status and a disabled "Sold Out" purchase action.

<!--
JSX interactive elements and their tests:
- <Link / clickable card body> to "/records/:id"
    → "Clicking a card opens the Record Detail page"
    → "Clicking an out-of-stock card still opens its detail page"
- <button> quick "Add to Cart" (enabled when in stock)
    → "Quick Add to Cart on an in-stock card adds the record"
    → "Quick add increments the cart on repeated use"
- <button disabled> quick "Add to Cart" + "Sold Out" badge (out of stock)
    → "Out-of-stock card shows Sold Out with a disabled add action"
- Summary fields (title, artist, genre tag, price, stock signal)
    → "Card displays record summary fields"
-->
