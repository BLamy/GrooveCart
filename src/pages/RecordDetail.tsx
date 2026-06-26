import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import type { RecordItem } from '../types'
import Breadcrumb from '../components/RecordDetail/Breadcrumb'
import RecordCover from '../components/RecordDetail/RecordCover'
import PurchasePanel from '../components/RecordDetail/PurchasePanel'
import RecordDetailSkeleton from '../components/RecordDetail/RecordDetailSkeleton'
import RecordNotFound from '../components/RecordDetail/RecordNotFound'

/**
 * RecordDetail page (`/records/:id`). Fetches a single record, renders a
 * two-column cover + purchase panel, and handles loading and not-found states.
 * Switching `:id` refetches with no stale data lingering from the prior record.
 */
export default function RecordDetail() {
  const { id } = useParams<{ id: string }>()
  const [record, setRecord] = useState<RecordItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setNotFound(false)
    setRecord(null)

    fetch(`/api/records/${id}`)
      .then(async (res) => {
        if (cancelled) return
        if (res.status === 404) {
          setNotFound(true)
          return
        }
        if (!res.ok) throw new Error('Failed to load record')
        const data = (await res.json()) as RecordItem
        if (!cancelled) setRecord(data)
      })
      .catch(() => {
        if (!cancelled) setNotFound(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id])

  return (
    <main data-testid="record-detail-page" className="mx-auto w-full max-w-5xl p-6 max-sm:p-3">
      {!loading && !notFound && record && (
        <div className="mb-6">
          <Breadcrumb title={record.title} />
        </div>
      )}

      {loading ? (
        <RecordDetailSkeleton />
      ) : notFound || !record ? (
        <RecordNotFound />
      ) : (
        <div data-testid="record-detail" className="grid grid-cols-1 gap-10 md:grid-cols-2">
          <RecordCover coverImage={record.coverImage} title={record.title} />
          <PurchasePanel record={record} />
        </div>
      )}
    </main>
  )
}
