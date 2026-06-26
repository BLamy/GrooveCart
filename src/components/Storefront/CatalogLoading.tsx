/**
 * Lightweight skeleton shown while the record catalog is being fetched. Mirrors
 * the RecordGrid layout so the page does not jump when the records arrive.
 */
export default function CatalogLoading() {
  return (
    <div
      className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4"
      aria-busy="true"
      aria-label="Loading records"
    >
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-card border border-border bg-surface">
          <div className="aspect-square animate-pulse bg-surface-muted" />
          <div className="flex flex-col gap-2 p-4">
            <div className="h-4 w-2/3 animate-pulse rounded bg-surface-muted" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-surface-muted" />
          </div>
        </div>
      ))}
    </div>
  )
}
