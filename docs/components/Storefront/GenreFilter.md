# GenreFilter

## Description

A dropdown in the CatalogToolbar that filters the catalog to a single genre. Its
options are "All genres" plus every distinct genre present in the seeded catalog,
sorted alphabetically. Selecting a genre narrows the RecordGrid to records of
that genre; "All genres" clears the filter.

## Interactions

- Open the dropdown.
- Select a genre option (or "All genres").

## Effects

- Opening: reveals the option list — "All genres", "Electronic", "Hip-Hop",
  "Jazz", "Rock", "Soul".
- Selecting a genre: the RecordGrid narrows to records of that genre, the
  trigger label updates to the selected genre, and the CatalogToolbar result
  count updates.
- Selecting "All genres": restores the full catalog (subject to any active
  search/sort).

## Dependencies

- Rendered inside the CatalogToolbar; filters
  [RecordGrid](RecordGrid.md) and updates the result count.
- Combines with [SearchField](SearchField.md) and
  [SortDropdown](SortDropdown.md).

## Tests

* Test: Dropdown opens with the catalog genres
  - Initial state: Storefront `/` loaded; the GenreFilter shows "All genres".
  - Action: Open the GenreFilter dropdown.
  - Expected: The options are "All genres", "Electronic", "Hip-Hop", "Jazz",
    "Rock", "Soul" (the 5 genres present in the seed plus "All genres").

* Test: Selecting Jazz narrows the grid and updates the count
  - Initial state: Storefront `/` with all 12 records visible; result count "12
    records".
  - Action: Open the GenreFilter and select "Jazz".
  - Expected: The RecordGrid shows the 2 Jazz records ("Kind of Blue" and "Blue
    Train"); the result count reads "2 records"; the trigger label reads "Jazz".

* Test: Selecting Rock shows all four Rock records
  - Initial state: Storefront `/` with all 12 records visible.
  - Action: Open the GenreFilter and select "Rock".
  - Expected: The grid shows the 4 Rock records ("Nevermind", "Rumours", "The
    Dark Side of the Moon", "Abbey Road"); result count "4 records".

* Test: Selecting "All genres" restores the catalog
  - Initial state: Storefront `/` with the GenreFilter set to "Jazz" (2 records
    visible).
  - Action: Open the GenreFilter and select "All genres".
  - Expected: The RecordGrid returns to all 12 records; result count "12
    records"; trigger label reads "All genres".

* Test: Genre filter used repeatedly in sequence
  - Initial state: Storefront `/` with all 12 records visible.
  - Action: Select "Electronic" (2 records), then select "Soul" (2 records), then
    select "Hip-Hop" (2 records).
  - Expected: After "Electronic" the grid shows "Random Access Memories" and
    "Discovery"; after "Soul" it shows "Songs in the Key of Life" and "What's
    Going On"; after "Hip-Hop" it shows "To Pimp a Butterfly" and "Madvillainy".
    The filter applies the new genre correctly on each subsequent selection.

<!--
JSX interactive elements and their tests:
- <select / dropdown trigger> genre filter
    → "Dropdown opens with the catalog genres"
    → "Selecting Jazz narrows the grid and updates the count"
    → "Selecting Rock shows all four Rock records"
    → "Selecting \"All genres\" restores the catalog"
    → "Genre filter used repeatedly in sequence"
-->
