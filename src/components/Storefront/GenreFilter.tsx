import { ChevronDown } from 'lucide-react'

/** Sentinel value for the "All genres" option (no genre filter applied). */
export const ALL_GENRES = ''

interface GenreFilterProps {
  /** Currently selected genre, or `ALL_GENRES` for no filter. */
  value: string
  /** Distinct genres present in the catalog (already sorted alphabetically). */
  genres: string[]
  onChange: (genre: string) => void
}

/**
 * Dropdown in the CatalogToolbar that narrows the catalog to a single genre.
 * Options are "All genres" plus every distinct genre in the catalog. Selecting
 * "All genres" clears the filter.
 */
export default function GenreFilter({ value, genres, onChange }: GenreFilterProps) {
  return (
    <label className="flex items-center gap-2 text-sm text-text-muted">
      <span className="font-medium">Genre</span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label="Filter records by genre"
          className="h-10 cursor-pointer appearance-none rounded-control border border-border bg-surface pl-3 pr-9 text-sm font-medium text-text focus:border-accent focus:outline-none"
        >
          <option value={ALL_GENRES}>All genres</option>
          {genres.map((genre) => (
            <option key={genre} value={genre}>
              {genre}
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
