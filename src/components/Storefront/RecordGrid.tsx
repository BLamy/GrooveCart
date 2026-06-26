import { SearchX } from 'lucide-react'
import type { RecordItem } from '../../types'
import RecordCard from './RecordCard'

interface RecordGridProps {
  records: RecordItem[]
}

/**
 * Responsive grid of RecordCard tiles for the filtered/sorted catalog. Reflows
 * from multi-column on desktop to one/two columns on mobile. When the active
 * search/filter combination excludes every record, shows the empty state.
 */
export default function RecordGrid({ records }: RecordGridProps) {
  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-card border border-dashed border-border bg-surface px-6 py-20 text-center">
        <SearchX className="h-10 w-10 text-text-muted" aria-hidden="true" />
        <p className="text-lg font-semibold text-text">No records match your search</p>
        <p className="text-sm text-text-muted">
          Try a different search term or clear the genre filter.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
      {records.map((record) => (
        <RecordCard key={record.id} record={record} />
      ))}
    </div>
  )
}
