import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { LogIn, Search } from 'lucide-react'
import Logo from './Logo'
import CartButton from './CartButton'
import CartDrawer from './Cart/CartDrawer'

/**
 * Persistent top bar shown on every page: the GrooveCart Logo, a search field,
 * and the CartButton. Submitting the search navigates to the Storefront with a
 * `q` query param. The CartDrawer is mounted here so the cart button can open it
 * from any page.
 */
export default function SiteHeader() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [query, setQuery] = useState(params.get('q') ?? '')

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = query.trim()
    navigate(trimmed ? `/?q=${encodeURIComponent(trimmed)}` : '/')
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--gc-border)] bg-[var(--gc-surface)]/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[var(--gc-max-width)] items-center gap-4 px-4 py-3 sm:px-6">
        <Logo />
        <form
          role="search"
          onSubmit={onSubmit}
          className="relative hidden flex-1 sm:block"
        >
          <Search
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--gc-text-muted)]"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search records or artists"
            aria-label="Search records"
            className="w-full rounded-[var(--gc-radius-control)] border border-[var(--gc-border)] bg-[var(--gc-surface-muted)] py-2 pl-10 pr-3 text-sm text-[var(--gc-text)] outline-none transition-colors focus:border-[var(--gc-accent)] focus:bg-[var(--gc-surface)]"
          />
        </form>
        <div className="ml-auto sm:ml-0">
          <div className="flex items-center gap-2">
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
        </div>
      </div>
      <CartDrawer />
    </header>
  )
}
