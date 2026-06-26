import { Link } from 'react-router-dom'

/** Footer shown on every page: store name + minimal navigation links. */
export default function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-[var(--gc-border)] bg-[var(--gc-surface)]">
      <div className="mx-auto flex max-w-[var(--gc-max-width)] flex-col items-center gap-3 px-6 py-8 text-sm text-[var(--gc-text-muted)] sm:flex-row sm:justify-between">
        <span className="font-bold text-[var(--gc-text)]">GrooveCart</span>
        <nav className="flex items-center gap-6">
          <Link to="/" className="transition-colors hover:text-[var(--gc-accent)]">
            Browse Records
          </Link>
          <Link to="/cart" className="transition-colors hover:text-[var(--gc-accent)]">
            Cart
          </Link>
        </nav>
        <span>Vinyl for the crate diggers.</span>
      </div>
    </footer>
  )
}
