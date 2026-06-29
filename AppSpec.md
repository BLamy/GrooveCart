# GrooveCart — Record Store

## Original Prompt

> Can you create a record store that uses stripe for buying records and neon for storing records in the database. I want to use vercel-labs/emulate when I test this app with playwright.

## Overview

GrooveCart is an online record store. Customers can browse a catalog of vinyl
records, view details for individual records, add records to a shopping cart, and
purchase them using Stripe checkout. The catalog is served from a static JSON
file, and order confirmation is reconstructed from Stripe Checkout session
metadata plus that catalog. The app is an e-commerce storefront for a record
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
- On successful payment, the order confirmation is reconstructed from the Stripe
  Checkout session and the static catalog.
- Show an order confirmation page summarizing the purchased records and total paid.
- Handle the cancelled / failed payment case by returning the customer to the cart
  with their items intact.

### Orders
- Store the compact cart snapshot on the Stripe Checkout session, keyed by the
  Stripe payment/session reference.
- Provide an order confirmation / order summary view for a completed purchase.

## Data Storage

The catalog is stored in `public/data/records.json` and served statically:
- **Records** — the catalog of records for sale (title, artist, genre, year,
  price, cover image, description, stock quantity).

The catalog should be seeded with a representative set of records spanning multiple
genres so the store is populated for browsing and testing.

## Integrations

- **Stripe** — used for all payment processing / checkout. Buying records goes
  through Stripe. Stripe Checkout session metadata carries the order reference
  and compact record/quantity snapshot used by the confirmation page.

## Testing Requirements

- The app is tested with Playwright.
- **`vercel-labs/emulate`** must be used to emulate / stub the Stripe payment flow
  when running the Playwright tests, so the checkout-and-purchase journey can be
  exercised end-to-end without performing real Stripe charges.

## Requirements & Constraints

- Buying records MUST go through Stripe (no ad-hoc/fake payment path in production).
- The catalog MUST be served from static JSON.
- Stock is static display/validation data; out-of-stock records cannot be
  purchased.
- The storefront should present a clean, streamlined interface focused on browsing
  records and completing a purchase.
