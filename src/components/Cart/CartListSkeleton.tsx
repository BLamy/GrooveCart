interface CartListSkeletonProps {
  rows?: number
}

/** Lightweight placeholder rows shown while cart line items are hydrating. */
export default function CartListSkeleton({ rows = 3 }: CartListSkeletonProps) {
  return (
    <div data-testid="cart-skeleton" className="divide-y divide-[var(--gc-border)]">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-4">
          <div className="h-24 w-24 shrink-0 animate-pulse rounded-[var(--gc-radius-control)] bg-[var(--gc-surface-muted)]" />
          <div className="flex flex-1 flex-col gap-2">
            <div className="h-4 w-1/2 animate-pulse rounded bg-[var(--gc-surface-muted)]" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-[var(--gc-surface-muted)]" />
            <div className="mt-2 h-9 w-28 animate-pulse rounded bg-[var(--gc-surface-muted)]" />
          </div>
        </div>
      ))}
    </div>
  )
}
