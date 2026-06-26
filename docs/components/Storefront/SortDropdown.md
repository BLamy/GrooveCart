# SortDropdown

## Description

A dropdown in the CatalogToolbar that re-orders the visible records. Options:
**Newest** (release year descending), **Price: Low→High**, **Price: High→Low**,
and **Artist A→Z**. The catalog defaults to **Newest** on load.

## Interactions

- Open the dropdown.
- Select a sort option.

## Effects

- Selecting an option re-orders the records currently shown in the RecordGrid
  (respecting any active search/genre filter). The trigger label updates to the
  selected option. The result count is unchanged by sorting.

## Dependencies

- Rendered inside the CatalogToolbar; re-orders
  [RecordGrid](RecordGrid.md).
- Combines with [SearchField](SearchField.md) and
  [GenreFilter](GenreFilter.md) (sorts the filtered subset).

## Tests

* Test: Default sort is Newest
  - Initial state: Storefront `/` freshly loaded with all 12 records; sort
    trigger shows "Newest".
  - Action: Observe the first record card in the grid.
  - Expected: With Newest (year descending), the first card is "To Pimp a
    Butterfly" (2015) and the last is "Blue Train" (1957).

* Test: Sort by Price Low→High
  - Initial state: Storefront `/` with the default "Newest" sort (12 records).
  - Action: Open the SortDropdown and select "Price: Low→High".
  - Expected: The grid re-orders by ascending price; the first card is
    "Discovery" ($27.99) and the last is "Songs in the Key of Life" ($42.99).

* Test: Sort by Price High→Low
  - Initial state: Storefront `/` with the default "Newest" sort (12 records).
  - Action: Open the SortDropdown and select "Price: High→Low".
  - Expected: The grid re-orders by descending price; the first card is "Songs in
    the Key of Life" ($42.99) and the last is "Discovery" ($27.99).

* Test: Sort by Artist A→Z
  - Initial state: Storefront `/` with the default "Newest" sort (12 records).
  - Action: Open the SortDropdown and select "Artist A→Z".
  - Expected: The grid re-orders alphabetically by artist; the first card is a
    "Daft Punk" record and the last card's artist is "The Beatles".

* Test: Switching back to Newest restores year-descending order
  - Initial state: Storefront `/` with the sort currently set to "Artist A→Z".
  - Action: Open the SortDropdown and select "Newest".
  - Expected: The grid re-orders by release year descending; the first card is
    again "To Pimp a Butterfly" (2015). Confirms the sort can be changed
    repeatedly and returns to the expected order.

<!--
JSX interactive elements and their tests:
- <select / dropdown trigger> sort dropdown
    → "Default sort is Newest"
    → "Sort by Price Low→High"
    → "Sort by Price High→Low"
    → "Sort by Artist A→Z"
    → "Switching back to Newest restores year-descending order"
-->
