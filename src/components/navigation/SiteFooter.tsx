import { Link } from 'react-router-dom'

/**
 * The footer rendered at the bottom of every page. Displays the store name as a
 * static label and a minimal set of navigation links (Browse Records → `/`,
 * Cart → `/cart`). Content is consistent across all pages.
 */
export default function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-surface">
      <div className="mx-auto flex w-full max-w-[var(--gc-max-width)] flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
        <span className="text-lg font-extrabold tracking-tight text-text">GrooveCart</span>
        <nav className="flex items-center gap-6 text-sm font-medium text-text-muted">
          <Link to="/" className="transition-colors hover:text-accent">
            Browse Records
          </Link>
          <Link to="/cart" className="transition-colors hover:text-accent">
            Cart
          </Link>
        </nav>
      </div>
    </footer>
  )
}
