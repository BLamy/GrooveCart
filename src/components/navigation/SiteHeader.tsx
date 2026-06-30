import { useSearchParams } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import Logo from './Logo'
import CartButton from './CartButton'
import SearchField from '../Storefront/SearchField'

/**
 * The shared top-bar chrome rendered on every page: the Logo wordmark, the
 * catalog SearchField, and the CartButton.
 *
 * The search query lives in the URL `?q=` param so it is shared across pages and
 * consumed by the Storefront for live filtering — the field works from anywhere
 * and the Storefront reads the same param. Updates replace history so typing
 * does not flood the back stack.
 */
export default function SiteHeader() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''

  const handleSearchChange = (value: string) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (value) {
          next.set('q', value)
        } else {
          next.delete('q')
        }
        return next
      },
      { replace: true },
    )
  }

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[var(--gc-max-width)] items-center gap-4 px-6 py-3">
        <Logo />
        <div className="flex flex-1 justify-center">
          <SearchField value={query} onChange={handleSearchChange} />
        </div>
        <Link
          to="/login"
          data-testid="header-login-link"
          className="inline-flex h-10 items-center gap-2 rounded-[var(--gc-radius-control)] border border-[var(--gc-border)] bg-[var(--gc-surface)] px-3 text-sm font-bold text-[var(--gc-text)] transition-colors hover:border-[var(--gc-accent)] hover:text-[var(--gc-accent)]"
        >
          <LogIn size={17} aria-hidden="true" />
          <span className="hidden md:inline">Sign in</span>
        </Link>
        <CartButton />
      </div>
    </header>
  )
}
