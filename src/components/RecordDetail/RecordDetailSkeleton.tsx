/**
 * Loading placeholder that occupies the two-column RecordDetail layout while
 * the record is being fetched.
 */
export default function RecordDetailSkeleton() {
  return (
    <div
      data-testid="record-detail-loading"
      className="grid grid-cols-1 gap-10 md:grid-cols-2"
      aria-busy="true"
    >
      <div className="aspect-square w-full animate-pulse rounded-card bg-surface-muted" />
      <div className="flex flex-col gap-4">
        <div className="h-9 w-3/4 animate-pulse rounded-control bg-surface-muted" />
        <div className="h-6 w-1/2 animate-pulse rounded-control bg-surface-muted" />
        <div className="h-24 w-full animate-pulse rounded-control bg-surface-muted" />
        <div className="h-10 w-1/3 animate-pulse rounded-control bg-surface-muted" />
        <div className="h-12 w-full animate-pulse rounded-control bg-surface-muted" />
      </div>
    </div>
  )
}
