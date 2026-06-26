import { Search } from 'lucide-react'

interface SearchFieldProps {
  /** Current query text. */
  value: string
  /** Called on every keystroke with the new query (live filtering, no submit). */
  onChange: (value: string) => void
}

/**
 * The catalog search input shown in the SiteHeader. Controlled by its parent;
 * filtering by title or artist happens live as the shopper types. Clearing the
 * field restores the full (genre/sort-respecting) catalog.
 */
export default function SearchField({ value, onChange }: SearchFieldProps) {
  return (
    <div className="relative w-full max-w-md">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search records or artists…"
        aria-label="Search records by title or artist"
        className="h-11 w-full rounded-control border border-border bg-surface pl-9 pr-3 text-sm text-text placeholder:text-text-muted focus:border-accent focus:outline-none"
      />
    </div>
  )
}
