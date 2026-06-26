import type { RecordItem } from '../types'

/**
 * Fetch the full catalog from `GET /api/records`. The result is memoized for the
 * lifetime of the page so the Cart page and the (separately mounted) CartDrawer
 * can both hydrate their line items without issuing duplicate requests. Call
 * `invalidateRecords()` to force a refetch after stock may have changed.
 */
let cache: Promise<RecordItem[]> | null = null

export function fetchRecords(): Promise<RecordItem[]> {
  if (!cache) {
    cache = (async () => {
      const res = await fetch('/api/records')
      if (!res.ok) {
        throw new Error(`Failed to load records (${res.status})`)
      }
      const data = (await res.json()) as RecordItem[]
      return Array.isArray(data) ? data : []
    })().catch((err) => {
      // Don't poison the cache on failure — allow a later retry.
      cache = null
      throw err
    })
  }
  return cache
}

export function invalidateRecords(): void {
  cache = null
}
