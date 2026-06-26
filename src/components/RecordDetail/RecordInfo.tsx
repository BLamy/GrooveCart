interface RecordInfoProps {
  title: string
  artist: string
  genre: string
  releaseYear: number
  description: string
}

/**
 * Static display of a record's descriptive details: title, artist, a
 * genre/year meta line, and the full description text. Non-interactive.
 */
export default function RecordInfo({
  title,
  artist,
  genre,
  releaseYear,
  description,
}: RecordInfoProps) {
  return (
    <div data-testid="record-info" className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h1 data-testid="record-title" className="text-3xl font-bold leading-tight text-text">
          {title}
        </h1>
        <p data-testid="record-artist" className="text-lg text-text-muted">
          {artist}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span
          data-testid="record-genre"
          className="rounded-control bg-surface-muted px-2.5 py-1 font-medium text-text"
        >
          {genre}
        </span>
        <span data-testid="record-year" className="text-text-muted">
          {releaseYear}
        </span>
      </div>
      <p data-testid="record-description" className="text-base leading-relaxed text-text-muted">
        {description}
      </p>
    </div>
  )
}
