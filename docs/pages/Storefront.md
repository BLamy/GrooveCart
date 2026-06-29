# Storefront

## Purpose

The home page and primary entry point of GrooveCart. It presents the full,
browseable catalog of vinyl records with tools to search, filter, and sort.
Every shopper journey (browse, search, build a cart) begins here. Out-of-stock
records remain visible but are clearly marked and not purchasable.

## Route

`/`

## Layout

- **SiteHeader** (shared, `navigation/`): persistent top bar containing the
  [Logo](../components/navigation/Logo.md) wordmark, the
  [SearchField](../components/Storefront/SearchField.md), and the
  [CartButton](../components/navigation/CartButton.md). Appears on every page.
- **CatalogToolbar**: a row above the grid containing the
  [GenreFilter](../components/Storefront/GenreFilter.md) dropdown, the
  [SortDropdown](../components/Storefront/SortDropdown.md), and a live result
  count label (e.g. "12 records"). The toolbar is a layout container; its
  interactive children are documented individually.
- **RecordGrid** ([RecordGrid](../components/Storefront/RecordGrid.md)):
  responsive grid of [RecordCard](../components/Storefront/RecordCard.md) tiles
  rendering the filtered/sorted catalog, with an empty state when filters
  exclude everything.
- **SiteFooter** (shared, `navigation/`):
  [SiteFooter](../components/navigation/SiteFooter.md) with store name and
  minimal links, consistent across pages.

## Data

Fetches the records catalog from `/data/records.json`, returning every record in
the catalog. Each record has: `id`, `title`, `artist`, `genre`, `releaseYear`,
`price`, `coverImage`, `description`, and `stock`.

The page shows a brief loading state while the catalog is fetched, the populated
grid once loaded, and the RecordGrid empty state ("No records match your
search") when active filters/search exclude every record. Search, genre filter,
and sort are applied client-side over the fetched catalog.

### Seed catalog (canonical reference for tests)

The catalog is seeded with **12 records** spanning **5 genres** (used by all
Storefront component test entries; `public/data/records.json` is canonical):

| Title | Artist | Genre | Year | Price | Stock |
|-------|--------|-------|------|-------|-------|
| To Pimp a Butterfly | Kendrick Lamar | Hip-Hop | 2015 | $32.99 | 6 |
| Random Access Memories | Daft Punk | Electronic | 2013 | $35.99 | 4 |
| Madvillainy | Madvillain | Hip-Hop | 2004 | $33.99 | 5 |
| Discovery | Daft Punk | Electronic | 2001 | $27.99 | 0 |
| Nevermind | Nirvana | Rock | 1991 | $28.99 | 7 |
| Rumours | Fleetwood Mac | Rock | 1977 | $29.99 | 8 |
| Songs in the Key of Life | Stevie Wonder | Soul | 1976 | $42.99 | 0 |
| The Dark Side of the Moon | Pink Floyd | Rock | 1973 | $37.99 | 1 |
| What's Going On | Marvin Gaye | Soul | 1971 | $30.99 | 9 |
| Abbey Road | The Beatles | Rock | 1969 | $39.99 | 3 |
| Kind of Blue | Miles Davis | Jazz | 1959 | $34.99 | 5 |
| Blue Train | John Coltrane | Jazz | 1957 | $31.99 | 2 |

- Genres present: **Electronic, Hip-Hop, Jazz, Rock, Soul** (5 genres). Rock has
  4 records, Hip-Hop / Electronic / Jazz / Soul have 2 each.
- **Sold out** records (stock 0): **Discovery** and **Songs in the Key of Life**.
- Low stock: **The Dark Side of the Moon** (1 left), **Blue Train** (2 left).
- The default sort is **Newest** (release year descending), so the first card on
  initial load is **To Pimp a Butterfly** (2015).
