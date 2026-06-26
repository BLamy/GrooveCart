import { Link } from 'react-router-dom'

/**
 * Shown when no record matches the `:id` in the URL (or the fetch fails). Gives
 * the shopper a clear path back to the Storefront catalog.
 */
export default function RecordNotFound() {
  return (
    <div
      data-testid="record-not-found"
      className="flex flex-col items-center gap-4 rounded-card border border-border bg-surface px-6 py-16 text-center shadow-card"
    >
      <h1 className="text-2xl font-bold text-text">Record not found</h1>
      <p className="text-text-muted">
        We couldn&apos;t find the record you were looking for. It may have sold out or been removed.
      </p>
      <Link
        to="/"
        data-testid="record-not-found-home-link"
        className="rounded-control bg-accent px-5 py-2.5 font-semibold text-white transition-colors hover:bg-accent-hover"
      >
        Back to Records
      </Link>
    </div>
  )
}
