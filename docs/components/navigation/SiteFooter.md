# SiteFooter

## Description

The footer rendered at the bottom of every page. It displays the store name
("GrooveCart") and a small set of minimal navigation links. Its content and link
set are consistent across the Storefront, Record Detail, Cart, and Order
Confirmation pages.

## Interactions

- Click the "Home" / "Browse Records" link.
- Click the "Cart" link.

## Effects

- "Home" / "Browse Records" link: navigates to the Storefront at `/`.
- "Cart" link: navigates to the full Cart page at `/cart`.

The store name "GrooveCart" is a static label (not a link in the footer; the
header Logo handles brand navigation).

## Dependencies

- Shared component, present on every page.
- Navigates to the [Storefront](../../pages/Storefront.md) (`/`) and the Cart
  page (`/cart`).

## Tests

* Test: Footer shows the store name
  - Initial state: App loaded on the Storefront `/`.
  - Action: Scroll to the footer.
  - Expected: The footer displays the store name "GrooveCart".

* Test: Footer Home link navigates to the Storefront
  - Initial state: Shopper is on the Cart page `/cart`.
  - Action: Click the footer "Browse Records" (Home) link.
  - Expected: The app navigates to `/`; the RecordGrid renders the seeded
    catalog.

* Test: Footer Cart link navigates to the Cart page
  - Initial state: Shopper is on the Storefront `/`.
  - Action: Click the footer "Cart" link.
  - Expected: The app navigates to `/cart`; the Cart page renders (showing either
    the cart line items or the empty-cart state).

<!--
JSX interactive elements and their tests:
- <a/Link to "/"> "Browse Records" / Home link
    → "Footer Home link navigates to the Storefront"
- <a/Link to "/cart"> "Cart" link
    → "Footer Cart link navigates to the Cart page"
- "GrooveCart" store name (static label)
    → "Footer shows the store name"
-->
