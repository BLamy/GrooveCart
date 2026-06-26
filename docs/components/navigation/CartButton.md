# CartButton

## Description

The cart button at the right of the SiteHeader. It shows a cart icon with a live
item-count badge reflecting the total quantity of records currently in the cart.
It appears on every page. Clicking it opens the CartDrawer for quick review.

## Interactions

- Click the cart button.
- Observe the count badge (passive, but it must update in response to cart
  mutations elsewhere in the app).

## Effects

- Click: opens the slide-in CartDrawer over the current page (does not change the
  route).
- Badge: displays the sum of line-item quantities in the cart. Hidden or showing
  "0" when the cart is empty; increments when a record is added (from a RecordCard
  quick-add or the detail AddToCartButton) and decrements when items are removed
  or quantities are reduced.

## Dependencies

- Rendered inside SiteHeader (shared navigation, present on every page).
- Reflects cart state mutated by
  [RecordCard](../Storefront/RecordCard.md) quick-add, the Record Detail
  AddToCartButton, and CartLineItem remove/quantity controls.
- Opens the CartDrawer.

## Tests

* Test: Cart badge starts empty
  - Initial state: App freshly loaded on the Storefront `/` with an empty cart.
  - Action: Observe the cart button badge in the header.
  - Expected: The badge shows no items (count 0 / hidden), indicating an empty
    cart.

* Test: Badge count reflects an added record
  - Initial state: Storefront `/` with an empty cart.
  - Action: On the in-stock "Rumours" RecordCard, click the quick "Add to Cart".
  - Expected: The cart button badge updates to "1".

* Test: Badge count updates after adding multiple records
  - Initial state: Storefront `/` with an empty cart.
  - Action: Quick-add "Rumours", then quick-add "Nevermind".
  - Expected: The cart button badge updates to "2".

* Test: Badge count decreases after removing an item
  - Initial state: Cart contains 2 records ("Rumours" and "Nevermind"); badge
    shows "2".
  - Action: Open the CartDrawer via the cart button and remove "Nevermind".
  - Expected: The cart button badge updates to "1".

* Test: Clicking the cart button opens the CartDrawer
  - Initial state: Storefront `/` with the CartDrawer closed.
  - Action: Click the cart button in the header.
  - Expected: The CartDrawer slides in over the page; the URL stays on the
    current route (`/`).

<!--
JSX interactive elements and their tests:
- <button> cart button (icon + count badge)
    → "Cart badge starts empty"
    → "Badge count reflects an added record"
    → "Badge count updates after adding multiple records"
    → "Badge count decreases after removing an item"
    → "Clicking the cart button opens the CartDrawer"
-->
