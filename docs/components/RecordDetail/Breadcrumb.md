# Breadcrumb

## Description

The breadcrumb trail at the top of the `RecordDetail` page (`/records/:id`),
below the `SiteHeader`. It renders a two-segment trail: a "Records" link
followed by the current record's title — `Records / {Title}` (e.g.
`Records / Kind of Blue`). It orients the shopper and provides a one-click path
back to the Storefront catalog.

## Interactions

- Click the **"Records"** segment (a link) to return to the Storefront.
- The trailing `{Title}` segment is the current page and is rendered as plain
  (non-link) text — it is not interactive.

## Effects

- Clicking "Records" navigates to the Storefront at route `/` (the catalog). The
  URL changes from `/records/:id` to `/`, and the full record catalog grid is
  shown.

## Dependencies

- Appears on the `RecordDetail` page. The `{Title}` segment reflects the title
  of the record fetched by the page (so it changes when navigating between
  records).
- Navigation target is the Storefront page (`/`).

## Tests

* Test: Breadcrumb shows "Records / {Title}" for the current record
  - Initial state: On the RecordDetail page for a known record (selected by a
    stable identifier — e.g. the record whose slug/title is fixed in the seed
    data), opened at `/records/:id`.
  - Action: Observe the breadcrumb trail.
  - Expected: The breadcrumb renders two segments: a "Records" link and the
    current record's exact title (matching the title rendered by `RecordInfo`),
    separated by a "/" divider. The title segment is not a link.

* Test: Clicking "Records" navigates back to the Storefront
  - Initial state: On the RecordDetail page at `/records/:id` for a seeded
    record, with the breadcrumb visible.
  - Action: Click the "Records" segment.
  - Expected: The app navigates to `/`; the URL becomes `/` and the Storefront
    catalog grid (RecordGrid) is displayed.
