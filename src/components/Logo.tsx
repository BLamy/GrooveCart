import { Link } from 'react-router-dom'
import { Disc3 } from 'lucide-react'

/** The GrooveCart wordmark in the SiteHeader; links home to the Storefront. */
export default function Logo() {
  return (
    <Link
      to="/"
      aria-label="GrooveCart home"
      className="flex shrink-0 items-center gap-2 text-lg font-extrabold tracking-tight text-[var(--gc-text)]"
    >
      <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--gc-accent)] text-white">
        <Disc3 size={20} />
      </span>
      <span>GrooveCart</span>
    </Link>
  )
}
