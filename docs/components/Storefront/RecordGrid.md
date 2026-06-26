# RecordGrid

## Description

The responsive grid that renders a [RecordCard](RecordCard.md) for each record
in the filtered/sorted catalog. It reflows from multi-column on desktop to
single/double column on mobile. When the active search/filter combination
excludes every record, it shows an empty state: "No records match your search".

## Interactions

The grid itself is a container; shopper interactions happen on its child
RecordCards (click to open detail, quick add to cart). The grid is driven by the
SearchField, GenreFilter, and SortDropdown — its contents and ordering change in
response to those controls. The only state the grid owns directly is which set of
cards (or the empty state) is rendered.

## Effects

- Renders one RecordCard per matching record, in the order chosen by the
  SortDropdown.
- Shows the "No records match your search" empty state when the matching set is
  empty.

## Dependencies

- Renders [RecordCard](RecordCard.md) tiles.
- Filtered by [SearchField](SearchField.md) and
  [GenreFilter](GenreFilter.md); ordered by
  [SortDropdown](SortDropdown.md).
- Lives on the [Storefront](../../pages/Storefront.md) page.

## Tests

* Test: Grid renders the seeded catalog
  - Initial state: Storefront `/` freshly loaded with no active search/filter.
  - Action: Wait for the catalog to load and count the rendered cards.
  - Expected: The grid renders 12 RecordCards, one per seeded record, including
    "To Pimp a Butterfly", "Kind of Blue", "Discovery", and "Abbey Road".

* Test: Grid shows the empty state when filters exclude everything
  - Initial state: Storefront `/` with all 12 records visible.
  - Action: Type "zzzzz" into the SearchField so no record matches.
  - Expected: The grid renders no RecordCards and displays the "No records match
    your search" empty state message.

* Test: Empty state clears when the filter is relaxed
  - Initial state: Storefront `/` showing the "No records match your search"
    empty state (search query "zzzzz").
  - Action: Clear the SearchField.
  - Expected: The empty state disappears and all 12 RecordCards render again.

<!--
JSX interactive elements: none directly on the grid container.
Child RecordCards carry their own interactions (see RecordCard.md).
The grid's rendered set / empty state is exercised by:
    → "Grid renders the seeded catalog"
    → "Grid shows the empty state when filters exclude everything"
    → "Empty state clears when the filter is relaxed"
-->
