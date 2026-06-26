# Logo

## Description

The GrooveCart wordmark displayed at the left of the SiteHeader. It appears on
every page (Storefront, Record Detail, Cart, Order Confirmation) as the brand
anchor and acts as a "home" link.

## Interactions

- Click the wordmark.

## Effects

- Navigates to the Storefront at `/`. The URL updates to `/` and the catalog
  grid renders.

## Dependencies

- Rendered inside SiteHeader (shared navigation, present on every page).
- Navigates to the [Storefront](../../pages/Storefront.md) page.

## Tests

* Test: Logo renders in the header
  - Initial state: App loaded on the Storefront `/`.
  - Action: Observe the SiteHeader.
  - Expected: The "GrooveCart" wordmark is visible in the header.

* Test: Clicking the logo from a detail page navigates home
  - Initial state: Shopper has navigated to a Record Detail page (e.g. opened
    "Kind of Blue") so the URL is `/records/:id`, not `/`.
  - Action: Click the GrooveCart wordmark in the header.
  - Expected: The app navigates to the Storefront; the URL becomes `/` and the
    RecordGrid renders the seeded records (12 records).

<!--
JSX interactive elements and their tests:
- <a/Link to "/"> GrooveCart wordmark
    → "Logo renders in the header"
    → "Clicking the logo from a detail page navigates home"
-->
