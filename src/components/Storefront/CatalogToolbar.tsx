import GenreFilter from './GenreFilter'
import SortDropdown, { type SortOption } from './SortDropdown'

interface CatalogToolbarProps {
  genre: string
  genres: string[]
  onGenreChange: (genre: string) => void
  sort: SortOption
  onSortChange: (sort: SortOption) => void
  /** Number of records currently matching the active search/filter. */
  resultCount: number
}

/**
 * The row above the RecordGrid: the GenreFilter and SortDropdown controls plus
 * a live result-count label (e.g. "12 records"). A layout container only — its
 * interactive children own their own behavior.
 */
export default function CatalogToolbar({
  genre,
  genres,
  onGenreChange,
  sort,
  onSortChange,
  resultCount,
}: CatalogToolbarProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-medium text-text-muted" aria-live="polite">
        {resultCount} record{resultCount === 1 ? '' : 's'}
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <GenreFilter value={genre} genres={genres} onChange={onGenreChange} />
        <SortDropdown value={sort} onChange={onSortChange} />
      </div>
    </div>
  )
}
