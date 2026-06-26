# RecordDetail

## Purpose

A dedicated page for a single vinyl record, reached when a shopper clicks a
RecordCard on the Storefront (or follows a direct link). It shows the record's
full details and is where the shopper decides to buy: it presents the cover,
the descriptive info, the price, the live stock status, a quantity stepper, and
the primary "Add to Cart" action. This is the focal point of the
`BuyASingleRecord` and `HandleOutOfStock` journeys.

## Route

`/records/:id` — `:id` is the record's database id. The page fetches the single
record identified by `:id`.

## Layout

The persistent `SiteHeader` (logo → home, search field, cart button opening the
`CartDrawer`) sits at the top on every page, and the `SiteFooter` at the bottom.

Below the header, the page renders a `Breadcrumb` trail ("Records / {Title}")
linking back to the Storefront.

The main content is a **two-column layout** (modeled on the Wax reference):

- **Left column — `RecordCover`**: the large cover image of the record.
- **Right column — purchase panel**, stacked vertically:
  - `RecordInfo` — title, artist, genre, release year, and the full description
    text.
  - `PriceBlock` — the prominent formatted price, with the `StockStatus`
    indicator rendered beside/below it.
  - `StockStatus` — availability indicator ("In stock", "Only N left", or
    "Sold out") derived from the record's stock quantity.
  - `QuantityStepper` — increment/decrement control to choose how many copies to
    add, capped at the available stock (accounting for any quantity already in
    the cart for this record) and floored at 1.
  - `AddToCartButton` — primary CTA that adds the selected quantity to the cart,
    opens/animates the `CartDrawer`, and updates the header cart count. Disabled
    and labeled "Sold Out" when the record is out of stock or the cart already
    holds all available stock.

On narrow viewports the two columns stack: cover on top, purchase panel below.

## Data

- Fetches a single record by `:id` from the records API
  (`GET /api/records/:id`), returning: `id`, `title`, `artist`, `genre`,
  `releaseYear`, `price`, `coverImage`, `description`, and `stock`.
- Reads the current cart (from the shared session cart state) to compute the
  remaining purchasable quantity (`stock` minus the quantity of this record
  already in the cart), which bounds the `QuantityStepper` and drives whether
  `AddToCartButton` is enabled.
- **Loading state**: while the record is being fetched, a skeleton/loading
  placeholder occupies the two-column layout.
- **Error / not-found state**: if no record matches `:id`, the page shows a
  "Record not found" message with a link back to the Storefront.
- Navigating directly from one record's detail page to another record's detail
  page (changing `:id`) must refetch and render the new record's data with no
  stale data lingering from the previous record.

## Components

- [Breadcrumb](../components/RecordDetail/Breadcrumb.md)
- RecordCover — static display of the cover image (non-interactive).
- RecordInfo — static display of title, artist, genre, year, description
  (non-interactive).
- PriceBlock — static display of the formatted price; hosts `StockStatus`
  (non-interactive).
- [StockStatus](../components/RecordDetail/StockStatus.md)
- [QuantityStepper](../components/shared/QuantityStepper.md)
- [AddToCartButton](../components/RecordDetail/AddToCartButton.md)
