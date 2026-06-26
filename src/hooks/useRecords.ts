import { useEffect, useMemo, useState } from 'react'
import type { RecordItem } from '../types'
import { fetchRecords } from '../api/records'

export interface UseRecordsResult {
  records: RecordItem[]
  /** Records keyed by id, for hydrating cart line items. */
  recordsById: Map<number, RecordItem>
  loading: boolean
  error: string | null
}

/**
 * Load the catalog and expose it both as a list and as an id→record map. Used by
 * the Cart page and the CartDrawer to hydrate their (id + quantity) line items
 * with authoritative title/price/stock data.
 */
export function useRecords(): UseRecordsResult {
  const [records, setRecords] = useState<RecordItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    fetchRecords()
      .then((recs) => {
        if (!active) return
        setRecords(recs)
        setError(null)
      })
      .catch((err: unknown) => {
        if (!active) return
        setError(err instanceof Error ? err.message : 'Failed to load records')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const recordsById = useMemo(
    () => new Map(records.map((r) => [r.id, r])),
    [records],
  )

  return { records, recordsById, loading, error }
}
