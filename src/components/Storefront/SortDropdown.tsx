import { ChevronDown } from 'lucide-react'

/** The catalog sort orders. `newest` (release year descending) is the default. */
export type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'artist-asc'

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low→High' },
  { value: 'price-desc', label: 'Price: High→Low' },
  { value: 'artist-asc', label: 'Artist A→Z' },
]

interface SortDropdownProps {
  value: SortOption
  onChange: (value: SortOption) => void
}

/**
 * Dropdown in the CatalogToolbar that re-orders the visible records. Sorting
 * does not change which records are shown (it respects the active search/genre
 * filter) and does not affect the result count.
 */
export default function SortDropdown({ value, onChange }: SortDropdownProps) {
  return (
    <label className="flex items-center gap-2 text-sm text-text-muted">
      <span className="font-medium">Sort</span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as SortOption)}
          aria-label="Sort records"
          className="h-10 cursor-pointer appearance-none rounded-control border border-border bg-surface pl-3 pr-9 text-sm font-medium text-text focus:border-accent focus:outline-none"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
          aria-hidden="true"
        />
      </div>
    </label>
  )
}
