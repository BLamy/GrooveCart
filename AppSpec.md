# GrooveCart — Record Store

## Original Prompt

> Can you create a record store that uses stripe for buying records and neon for storing records in the database. I want to use vercel-labs/emulate when I test this app with playwright.

## Overview

GrooveCart is an online record store. Customers can browse a catalog of vinyl
records, view details for individual records, add records to a shopping cart, and
purchase them using Stripe checkout. Records and orders are stored in a Neon
(serverless Postgres) database. The app is an e-commerce storefront for a record
shop, combining a browseable record catalog with a real checkout flow.

## Core Functionality

### Record Catalog
- Display a browseable catalog of records (vinyl albums).
- Each record has: title, artist, genre, release year, price, cover image,
  description, and available stock quantity.
- Support searching records by title or artist.
- Support filtering the catalog by genre.
- Support sorting (e.g. by price, by artist, by newest).
- Records that are out of stock are visibly marked and cannot be purchased.

### Record Detail
- A dedicated page per record showing the full details, cover image, price, and
  stock status.
- An "Add to Cart" action that adds the record to the cart (disabled when out of
  stock or when the cart already holds all available stock).

### Shopping Cart
- A cart that holds selected records with per-line quantities.
- Update the quantity of a line item or remove it from the cart.
- Show the running subtotal, per-line totals, and the order total.
- Cart contents persist across navigation within a session.
- Prevent adding more of a record than is in stock.

### Checkout & Payments (Stripe)
- Checkout is powered by Stripe. The customer is taken through a Stripe checkout
  flow to pay for the records in their cart.
- On successful payment, an order is created and recorded in the database, and the
  purchased records' stock is decremented.
- Show an order confirmation page summarizing the purchased records and total paid.
- Handle the cancelled / failed payment case by returning the customer to the cart
  with their items intact.

### Orders
- Persist each completed order with: the line items (records and quantities), the
  total amount, the Stripe payment/session reference, a status, and a timestamp.
- Provide an order confirmation / order summary view for a completed purchase.

## Data Storage (Neon)

All persistent data is stored in a Neon serverless Postgres database:
- **Records** — the catalog of records for sale (title, artist, genre, year, price,
  cover image, description, stock quantity).
- **Orders** — completed purchases, including the Stripe session/payment reference,
  total, and status.
- **Order line items** — the records and quantities belonging to each order.

The catalog should be seeded with a representative set of records spanning multiple
genres so the store is populated for browsing and testing.

## Integrations

- **Stripe** — used for all payment processing / checkout. Buying records goes
  through Stripe.
- **Neon** — serverless Postgres used as the application database for storing
  records, orders, and order line items.

## Testing Requirements

- The app is tested with Playwright.
- **`vercel-labs/emulate`** must be used to emulate / stub the Stripe payment flow
  when running the Playwright tests, so the checkout-and-purchase journey can be
  exercised end-to-end without performing real Stripe charges.

## Requirements & Constraints

- Buying records MUST go through Stripe (no ad-hoc/fake payment path in production).
- Records and orders MUST be stored in Neon.
- Stock must be tracked and decremented on a successful purchase; out-of-stock
  records cannot be purchased.
- The storefront should present a clean, streamlined interface focused on browsing
  records and completing a purchase.
