# References

These real-world products were reviewed in Refero and shaped the information architecture below.

- Wax — Vinyl Record Store Template (Lovable): Directly comparable record store. Borrowed the album-art-forward catalog grid (cover, title, artist, price), the **slide-in cart drawer** opened from the header, and the two-column record detail (large cover left, purchase panel right with a **quantity stepper** + single "Add to Cart" CTA). This is the primary visual/IA reference.
- Urban Outfitters Music Shop & Klarna "Throwback sounds" catalog: Borrowed the catalog toolbar pattern — a **search field, genre filter dropdown, sort dropdown, and a result count** sitting above a responsive product grid. Reinforced keeping the storefront clean and content-first.
- Square shopping cart: Borrowed the **two-column cart layout** (line-item list on the left, sticky order summary on the right) with per-line quantity steppers and remove actions.
- New Balance & AVNIER "Checkout and Payment" flows: Confirmed the handoff-to-external-payment pattern (cart → external payment provider → order confirmation with an order number). Because GrooveCart uses **Stripe Checkout (hosted)**, we deliberately do NOT build our own shipping/payment form pages — Stripe owns those steps, and we own the cart, the redirect, and the confirmation.
- DailyArt "Cart review and empty-cart recovery": Borrowed the **empty-cart state** with a clear "Browse Records" CTA, and a confirmation banner when an item is removed.

# Users

## Vinyl Shopper (Crate-Digger)

A music enthusiast who knows what they like and enjoys browsing by genre and artist. They want to quickly scan covers, drill into a record's details (pressing, year, condition/stock), and buy without friction. They care about whether a specific record is in stock and will be discouraged by a clunky checkout.

Journeys:
- BrowseAndDiscover: Land on the storefront → scan the catalog grid of records → filter by genre (e.g. "Jazz") and sort by "Newest" or "Price" → scroll results → click a record that catches their eye to open its detail page.
- SearchForRecord: Use the search field in the header/toolbar to type an artist or album title → see the catalog narrow to matching records → open the matching record's detail page.
- BuyASingleRecord: From a record detail page, confirm it's in stock → set quantity → "Add to Cart" → open the cart drawer → "Checkout" → complete payment in Stripe → land on the order confirmation page.

## Gift Buyer (Casual Shopper)

A less frequent visitor buying one or a few records, possibly as a gift. They are not loyal to a genre and rely on browsing and clear stock/price signals. They need reassurance the purchase succeeded and a clear summary of what they bought.

Journeys:
- BuildAMultiRecordOrder: Browse the catalog → add several different records to the cart from either the grid (quick add) or detail pages → open the cart → adjust quantities and remove anything unwanted → review the running totals → proceed to checkout.
- HandleOutOfStock: Open a record that is out of stock → see it clearly marked as sold out with the "Add to Cart" action disabled → return to the catalog to find an in-stock alternative.
- RecoverFromCancelledPayment: Start checkout → cancel or fail payment in Stripe → get returned to the cart with all items still intact → retry checkout when ready.
- ReviewCompletedOrder: After a successful purchase, see the order confirmation page summarizing the purchased records, quantities, line totals, the order total, and an order reference.

# Pages

## Storefront (Catalog)

The home page and primary entry point. Presents the full, browseable catalog of vinyl records with tools to search, filter, and sort. Out-of-stock records are visible but clearly marked and not purchasable. This is where every journey begins.

Components:
- SiteHeader: Persistent top bar with the GrooveCart logo/wordmark (links home), the catalog search field, and a cart button showing the current item count that opens the CartDrawer. Appears on every page.
- CatalogToolbar: Row above the grid containing the GenreFilter dropdown, the SortDropdown (Newest, Price: Low→High, Price: High→Low, Artist A→Z), and a live result count ("24 records").
- SearchField: Text input (in header/toolbar) that filters the catalog by record title or artist as the shopper types.
- GenreFilter: Dropdown to filter the catalog to a single genre (or "All genres"), populated from the genres present in the catalog.
- SortDropdown: Dropdown that re-orders the visible records by price, artist, or newest release.
- RecordGrid: Responsive grid of RecordCards rendering the filtered/sorted catalog; shows an empty state ("No records match your search") when filters exclude everything.
- RecordCard: Catalog tile showing the cover image, title, artist, genre tag, price, and stock signal. Clicking it opens the RecordDetail page. Includes a quick "Add to Cart" affordance for in-stock records and a "Sold Out" badge (with disabled action) for out-of-stock records.
- SiteFooter: Footer with store name and minimal links; consistent across pages.

## Record Detail

A dedicated page for a single record showing its full details so the shopper can decide to buy. Modeled on the two-column reference layout: large cover image on the left, purchase panel on the right.

Components:
- Breadcrumb: "Records / {Title}" trail linking back to the Storefront.
- RecordCover: Large cover image of the record.
- RecordInfo: Title, artist, genre, release year, and the full description text.
- PriceBlock: Prominent price and the StockStatus indicator (e.g. "In stock", "Only 2 left", or "Sold out").
- StockStatus: Visual indicator of availability derived from stock quantity; drives whether purchase controls are enabled.
- QuantityStepper: Increment/decrement control to choose how many copies to add, capped at the available stock and never allowing more than remaining stock (accounting for what's already in the cart).
- AddToCartButton: Primary CTA that adds the selected quantity to the cart and opens/animates the CartDrawer. Disabled (and labeled "Sold Out") when the record is out of stock or the cart already holds all available stock.

## Cart

The review-and-edit surface for the shopper's selected records before paying. Exists both as a slide-in CartDrawer (quick access from the header on any page) and as a full Cart page for focused review. Both share the same line-item and summary components and persist contents across navigation within the session.

Components:
- CartDrawer: Slide-in panel opened from the SiteHeader cart button; lists current line items with compact controls and a summary, plus a "Checkout" CTA and a "View Cart" link to the full Cart page. Shows the empty state when no items are present.
- CartLineItem: A row per record in the cart showing cover thumbnail, title, artist, unit price, a QuantityStepper (bounded by stock), the per-line total, and a remove action.
- QuantityStepper: Reused control to change a line item's quantity; prevents exceeding the record's available stock.
- OrderSummary: Sticky panel showing the subtotal, per-line totals roll-up, and the order total, with the primary "Checkout" button that initiates the Stripe Checkout session.
- EmptyCartState: Shown when the cart has no items — a friendly message and a "Browse Records" button returning to the Storefront.
- RemovedItemBanner: Transient confirmation banner shown after removing a line item.
- CheckoutButton: Initiates checkout by creating a Stripe Checkout session and redirecting the shopper to Stripe's hosted payment page.

## Checkout Handoff (Stripe)

Not a page GrooveCart renders, but a documented step in every purchase journey. The CheckoutButton creates a Stripe Checkout session from the current cart server-side and redirects to Stripe's hosted checkout. Stripe collects payment details. On success Stripe redirects to the Order Confirmation page; on cancellation it returns the shopper to the Cart with items intact. Recording the order and decrementing stock happens server-side upon successful payment confirmation.

Components:
- (External) StripeHostedCheckout: Stripe-owned payment UI. GrooveCart only provides the line items/amounts and the success/cancel return URLs.

## Order Confirmation

The post-purchase page reached after a successful Stripe payment. Reassures the shopper the purchase succeeded and summarizes exactly what they bought. Reached via the Stripe success redirect, which carries the session reference used to look up the recorded order.

Components:
- ConfirmationHeader: Success message and the order reference/number for the completed order.
- OrderSummaryList: List of purchased line items (cover thumbnail, title, artist, quantity, unit price, line total) for the order.
- OrderTotals: The total amount paid for the order.
- ContinueShoppingButton: CTA returning the shopper to the Storefront to keep browsing.
- ConfirmationLoadingState: Shown briefly while the order is looked up from the Stripe session reference after redirect, with a graceful message if the order is still being finalized.
