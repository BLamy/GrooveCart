interface RecordCoverProps {
  coverImage: string
  title: string
}

/**
 * Large, square cover image of the record — the hero of the detail page. Purely
 * a static display; non-interactive.
 */
export default function RecordCover({ coverImage, title }: RecordCoverProps) {
  return (
    <div
      data-testid="record-cover"
      className="overflow-hidden rounded-card border border-border bg-surface-muted shadow-card"
    >
      <img
        src={coverImage}
        alt={`${title} album cover`}
        className="aspect-square w-full object-cover"
      />
    </div>
  )
}
