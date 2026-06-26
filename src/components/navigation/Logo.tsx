import { Link } from 'react-router-dom'
import { Disc3 } from 'lucide-react'

/**
 * The GrooveCart wordmark shown at the left of the SiteHeader on every page.
 * Acts as the brand anchor and the "home" link back to the Storefront (`/`).
 */
export default function Logo() {
  return (
    <Link
      to="/"
      aria-label="GrooveCart home"
      className="flex shrink-0 items-center gap-2 text-text"
    >
      <Disc3 className="h-7 w-7 text-accent" strokeWidth={2} aria-hidden="true" />
      <span className="text-xl font-extrabold tracking-tight">GrooveCart</span>
    </Link>
  )
}
