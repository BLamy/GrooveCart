# Cart

## Purpose

The Cart page is the focused review-and-edit surface for the records a shopper
intends to buy. Shoppers land here to review every selected record, adjust
quantities, remove anything they don't want, see the running totals, and start
checkout. The same selection is also reachable from any page through the slide-in
`CartDrawer` (opened from the `SiteHeader` cart button); the full Cart page is the
expanded, two-column view of that same cart.

The cart's contents persist across navigation within the session — adding records
on the Storefront or a Record Detail page, navigating away, and returning to
`/cart` shows the same line items with the same quantities. Both the drawer and
the page read from and write to the same cart state, so a change made in one is
immediately reflected in the other.

## Route

`/cart`

## Layout

The page uses the persistent `SiteHeader` at the top (logo links home, search
field, cart button with live item count) and the `SiteFooter` at the bottom,
consistent with every other page.

The main content is a two-column layout (modeled on the Square shopping-cart
reference):

- **Left column — line-item list:** a vertical list of `CartLineItem` rows, one
  per record in the cart. Each row shows the cover thumbnail, title, artist, unit
  price, a `QuantityStepper`, the per-line total, and a remove action. A page
  heading ("Your Cart") with the total item count sits above the list.
- **Right column — sticky order summary:** the `OrderSummary` panel, which stays
  pinned (sticky) as the line-item list scrolls. It shows the subtotal, the
  per-line roll-up, the order total, and the primary `CheckoutButton`.

When the cart is empty, the two-column layout is replaced by the `EmptyCartState`
(friendly message + "Browse Records" button).

After a line item is removed, the transient `RemovedItemBanner` appears near the
top of the content area confirming which record was removed, then auto-dismisses.

On narrow/mobile widths the two columns stack: the line-item list first, with the
`OrderSummary` collapsing to the bottom (or pinned as a compact bar) so the
`CheckoutButton` stays reachable.

### CartDrawer (slide-in)

The `CartDrawer` is documented as part of the Cart surface but is not a separate
route — it is a panel that slides in over the current page when the shopper clicks
the cart button in the `SiteHeader`. It lists the same line items in a compact
form with a summary, a `Checkout` CTA, and a `View Cart` link that navigates to
this `/cart` page. It shows the `EmptyCartState` when the cart has no items. See
`docs/components/Cart/CartDrawer.md`.

## Data

The cart itself is client/session state (persisted for the session, e.g. via
`localStorage` or a session-scoped store) so it survives navigation without a
round-trip. Each line item references a record by id and stores a quantity; record
details (title, artist, unit price, cover image, current stock) are read from the
catalog/records API so prices and stock bounds stay authoritative.

- **Line items:** rendered from the persisted cart state, hydrated with record
  data (title, artist, unit price, cover, available stock) from the records API.
- **Totals:** the subtotal, per-line totals, and order total are computed on the
  client from `unit price × quantity` summed across line items (see `OrderSummary`).
- **Checkout:** the `CheckoutButton` posts the current cart line items to a
  server endpoint that creates a Stripe Checkout session and returns a redirect
  URL; the browser is then redirected to Stripe's hosted page.

States:
- **Loading:** while record data for the cart's line items is being hydrated, the
  list shows lightweight skeleton rows.
- **Empty:** when there are no line items, the `EmptyCartState` is shown instead
  of the two-column layout.
- **Populated:** the two-column line-item + sticky summary layout.

## Components

- `CartLineItem` — `docs/components/Cart/CartLineItem.md`
- `OrderSummary` — `docs/components/Cart/OrderSummary.md`
- `CheckoutButton` — `docs/components/Cart/CheckoutButton.md`
- `EmptyCartState` — `docs/components/Cart/EmptyCartState.md`
- `RemovedItemBanner` — `docs/components/Cart/RemovedItemBanner.md`
- `CartDrawer` — `docs/components/Cart/CartDrawer.md`
- `QuantityStepper` — shared control reused by `CartLineItem` (and the Record
  Detail purchase panel); bounded by the record's available stock.
- `SiteHeader` / `SiteFooter` — shared chrome documented under the Storefront.
