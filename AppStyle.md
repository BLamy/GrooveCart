# GrooveCart — Style Guide

GrooveCart is an online vinyl record store. The visual style should feel like a
modern, tasteful record shop: warm, music-forward, and uncluttered, with the
album cover art doing most of the visual work. Clean and streamlined first;
personality second.

## Overall Feel

- Modern e-commerce storefront with a crate-digging / record-shop warmth.
- Let album cover art be the hero — generous, square imagery in the catalog grid
  and on detail pages.
- Calm, neutral surfaces so the colorful album art stands out. Avoid loud
  backgrounds that compete with cover art.
- Spacious, breathable layout; clear visual hierarchy; nothing crowded.

## Color

- Base on a near-white / very light warm neutral background for the storefront,
  with dark, near-black text for strong readability.
- A single accent color used consistently for primary actions (Add to Cart,
  Checkout), active states, and key highlights. A deep warm tone (e.g. burnt
  orange / amber) or a confident jewel tone works well for a record shop; pick
  one and apply it consistently.
- Reserve a clear, distinct treatment (muted/desaturated, a badge) for
  out-of-stock records so they read as unavailable at a glance.
- Use a quiet secondary/neutral palette (grays) for borders, dividers, and
  secondary text.

## Typography

- Clean, legible sans-serif for UI and body text.
- Album/record titles and section headings should be visually prominent (larger,
  heavier weight) to anchor the catalog and detail pages.
- Artist names act as a clear secondary line beneath titles.
- Keep prices unambiguous and easy to scan.

## Layout

- **Catalog:** a responsive grid of record cards. Each card shows the square cover
  image, title, artist, genre, and price, plus a clear out-of-stock indicator when
  applicable. Search, genre filter, and sort controls sit above the grid in a
  clean toolbar.
- **Record detail:** large cover image alongside title, artist, genre, year,
  price, stock status, description, and a prominent Add to Cart action.
- **Cart:** a clear line-item list with cover thumbnail, title/artist, per-line
  quantity controls, per-line total, and a prominent order summary (subtotal,
  total) with the Checkout action.
- **Order confirmation:** a clean summary of purchased records, quantities, and
  total paid, with a positive confirmation state.

## Components & Interaction

- Primary buttons (Add to Cart, Checkout) use the accent color and are clearly the
  most prominent action on their surface.
- Disabled states (out of stock, quantity at max available stock) are visibly
  inert and not mistakable for active buttons.
- Quantity steppers in the cart are compact and obvious.
- Provide gentle feedback for actions (e.g. adding to cart, cart count updating).
- Maintain consistent rounded corners, spacing, and card styling across the app.

## Imagery

- Cover art is square and consistently sized within the catalog grid.
- Use a tasteful placeholder for any record missing cover art so the grid stays
  uniform.

## Responsiveness & Accessibility

- Fully responsive: the catalog grid reflows gracefully from multi-column on
  desktop to single/double column on mobile; cart and detail pages stack cleanly.
- Sufficient color contrast for text and controls.
- Interactive controls are keyboard-focusable with visible focus states and have
  accessible labels.
