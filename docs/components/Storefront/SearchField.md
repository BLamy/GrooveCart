# SearchField

## Description

The catalog search input in the SiteHeader. As the shopper types, it filters the
RecordGrid to records whose **title or artist** matches the query
(case-insensitive substring match). It works in combination with the GenreFilter
and SortDropdown.

## Interactions

- Type text into the search input.
- Clear the input (delete the text).

## Effects

- Filtering is applied live as the shopper types (no submit button needed).
- The RecordGrid narrows to records whose title or artist contains the query.
- The CatalogToolbar result count updates to the number of matching records.
- When no records match, the RecordGrid shows the "No records match your search"
  empty state.
- Clearing the input restores the full (genre/sort-respecting) catalog.

## Dependencies

- Rendered inside SiteHeader; filters
  [RecordGrid](RecordGrid.md) and updates the result count.
- Combines with [GenreFilter](GenreFilter.md) and
  [SortDropdown](SortDropdown.md) — all three constrain the same visible set.

## Tests

* Test: Typing an artist filters the grid
  - Initial state: Storefront `/` loaded with all 12 seeded records; result count
    "12 records".
  - Action: Type "Daft" into the search field.
  - Expected: The RecordGrid narrows to the 2 Daft Punk records ("Discovery" and
    "Random Access Memories"); the result count reads "2 records".

* Test: Typing a title fragment matching multiple records
  - Initial state: Storefront `/` with the search field empty (12 records).
  - Action: Type "Blue" into the search field.
  - Expected: The grid shows the 2 records whose title contains "Blue" — "Blue
    Train" and "Kind of Blue"; result count "2 records".

* Test: Search is exercised repeatedly in sequence
  - Initial state: Storefront `/` with the search field empty (12 records).
  - Action: Type "Miles" (grid shows only "Kind of Blue"), then clear the field,
    then type "Nirvana".
  - Expected: After "Miles" exactly 1 record ("Kind of Blue") is shown; after
    clearing, all 12 records return; after "Nirvana" exactly 1 record
    ("Nevermind") is shown. The field filters correctly on each subsequent use.

* Test: Search works after a genre filter change
  - Initial state: Storefront `/`; the GenreFilter is set to "Rock" so the grid
    shows the 4 Rock records.
  - Action: Type "Nev" into the search field.
  - Expected: The grid narrows to "Nevermind" (the Rock record matching "Nev");
    result count "1 record". Search and genre filter compose.

* Test: No matches shows the empty state
  - Initial state: Storefront `/` with all 12 records visible.
  - Action: Type "zzzzz" into the search field.
  - Expected: The RecordGrid shows the "No records match your search" empty state;
    result count "0 records".

* Test: Clearing the search restores the full catalog
  - Initial state: Storefront `/` with "Daft" typed in the search field (2
    records visible).
  - Action: Delete all text from the search field.
  - Expected: The RecordGrid returns to all 12 seeded records; result count "12
    records".

<!--
JSX interactive elements and their tests:
- <input type="search"> catalog search field
    → "Typing an artist filters the grid"
    → "Typing a title fragment matching multiple records"
    → "Search is exercised repeatedly in sequence"
    → "Search works after a genre filter change"
    → "No matches shows the empty state"
    → "Clearing the search restores the full catalog"
-->
