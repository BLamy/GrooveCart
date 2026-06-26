import { Link } from 'react-router-dom'

interface BreadcrumbProps {
  /** Title of the current record (the trailing, non-link segment). */
  title: string
}

/**
 * Two-segment breadcrumb trail shown below the SiteHeader on RecordDetail:
 * a "Records" link back to the Storefront catalog, a "/" divider, and the
 * current record's title rendered as plain (non-link) text.
 */
export default function Breadcrumb({ title }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      data-testid="breadcrumb"
      className="flex items-center gap-2 text-sm"
    >
      <Link
        to="/"
        data-testid="breadcrumb-records-link"
        className="text-text-muted transition-colors hover:text-accent"
      >
        Records
      </Link>
      <span aria-hidden="true" className="text-border">
        /
      </span>
      <span data-testid="breadcrumb-title" aria-current="page" className="font-medium text-text">
        {title}
      </span>
    </nav>
  )
}
