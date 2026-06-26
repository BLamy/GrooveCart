import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { RecordItem } from '../types'
import SiteHeader from '../components/navigation/SiteHeader'
import SiteFooter from '../components/navigation/SiteFooter'
import CatalogToolbar from '../components/Storefront/CatalogToolbar'
import CatalogLoading from '../components/Storefront/CatalogLoading'
import RecordGrid from '../components/Storefront/RecordGrid'
import { ALL_GENRES } from '../components/Storefront/GenreFilter'
import type { SortOption } from '../components/Storefront/SortDropdown'

/**
 * The Storefront (home) page. Fetches the full catalog from `GET /api/records`,
 * then applies the shopper's search (from the header `?q=` param), genre filter,
 * and sort entirely client-side. Renders the persistent SiteHeader, the
 * CatalogToolbar, the RecordGrid (or its empty state), and the SiteFooter.
 */
export default function Storefront() {
  const [searchParams] = useSearchParams()
  const search = searchParams.get('q') ?? ''

  const [records, setRecords] = useState<RecordItem[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [genre, setGenre] = useState<string>(ALL_GENRES)
  const [sort, setSort] = useState<SortOption>('newest')

  useEffect(() => {
    let active = true
    setError(null)
    fetch('/api/records')
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`)
        return res.json()
      })
      .then((data: RecordItem[]) => {
        if (active) setRecords(data)
      })
      .catch(() => {
        if (active) setError('We could not load the catalog. Please try again.')
      })
    return () => {
      active = false
    }
  }, [])

  const genres = useMemo(() => {
    if (!records) return []
    return Array.from(new Set(records.map((r) => r.genre))).sort((a, b) => a.localeCompare(b))
  }, [records])

  const visibleRecords = useMemo(() => {
    if (!records) return []
    const query = search.trim().toLowerCase()

    const filtered = records.filter((r) => {
      const matchesSearch =
        query === '' ||
        r.title.toLowerCase().includes(query) ||
        r.artist.toLowerCase().includes(query)
      const matchesGenre = genre === ALL_GENRES || r.genre === genre
      return matchesSearch && matchesGenre
    })

    const sorted = [...filtered]
    switch (sort) {
      case 'price-asc':
        sorted.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        sorted.sort((a, b) => b.price - a.price)
        break
      case 'artist-asc':
        sorted.sort((a, b) => a.artist.localeCompare(b.artist))
        break
      case 'newest':
      default:
        sorted.sort((a, b) => b.releaseYear - a.releaseYear)
        break
    }
    return sorted
  }, [records, search, genre, sort])

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <SiteHeader />
      <main className="mx-auto w-full max-w-[var(--gc-max-width)] flex-1 px-6 py-8">
        <div className="mb-6 flex flex-col gap-2">
          <h1 className="text-2xl font-extrabold tracking-tight text-text">Browse the catalog</h1>
          <p className="text-sm text-text-muted">
            Hand-picked vinyl across jazz, soul, rock, hip-hop, and electronic.
          </p>
        </div>

        {error ? (
          <div className="rounded-card border border-border bg-surface px-6 py-16 text-center">
            <p className="text-base font-semibold text-text">{error}</p>
          </div>
        ) : records === null ? (
          <CatalogLoading />
        ) : (
          <div className="flex flex-col gap-6">
            <CatalogToolbar
              genre={genre}
              genres={genres}
              onGenreChange={setGenre}
              sort={sort}
              onSortChange={setSort}
              resultCount={visibleRecords.length}
            />
            <RecordGrid records={visibleRecords} />
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
