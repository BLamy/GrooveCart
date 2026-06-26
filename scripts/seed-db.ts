import { neon } from '@neondatabase/serverless'
import { execFileSync } from 'node:child_process'
import { realpathSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { schemaStatements, migrationStatements, initSchema } from './schema'

/**
 * Canonical seed data for GrooveCart.
 *
 * These are the 12 records documented in `docs/pages/Storefront.md`
 * ("Seed catalog (canonical reference for tests)"). The list must match that
 * table exactly — every Storefront component test entry depends on it:
 *   - 12 records across 5 genres (Rock x4; Hip-Hop / Electronic / Jazz / Soul x2)
 *   - Sold out (stock 0): "Discovery", "Songs in the Key of Life"
 *   - Default sort is Newest (release year desc) → first card is
 *     "To Pimp a Butterfly" (2015).
 *
 * Prices are stored in integer cents to keep money math exact and Stripe-ready.
 */
export interface SeedRecord {
  slug: string
  title: string
  artist: string
  genre: string
  releaseYear: number
  priceCents: number
  coverImage: string
  description: string
  stock: number
}

function cover(slug: string): string {
  // Deterministic square placeholder art keyed by slug, so the grid stays uniform.
  return `https://picsum.photos/seed/groovecart-${slug}/600/600`
}

export const RECORDS: SeedRecord[] = [
  {
    slug: 'to-pimp-a-butterfly',
    title: 'To Pimp a Butterfly',
    artist: 'Kendrick Lamar',
    genre: 'Hip-Hop',
    releaseYear: 2015,
    priceCents: 3299,
    coverImage: cover('to-pimp-a-butterfly'),
    description:
      'A sprawling, jazz- and funk-soaked statement on Black identity, fame, and self-worth — widely hailed as one of the defining hip-hop albums of its decade.',
    stock: 6,
  },
  {
    slug: 'random-access-memories',
    title: 'Random Access Memories',
    artist: 'Daft Punk',
    genre: 'Electronic',
    releaseYear: 2013,
    priceCents: 3599,
    coverImage: cover('random-access-memories'),
    description:
      'Daft Punk trade samplers for live session players and disco strings on a lush, Grammy-winning love letter to the golden age of analog studio craft.',
    stock: 4,
  },
  {
    slug: 'madvillainy',
    title: 'Madvillainy',
    artist: 'Madvillain',
    genre: 'Hip-Hop',
    releaseYear: 2004,
    priceCents: 3399,
    coverImage: cover('madvillainy'),
    description:
      'MF DOOM and Madlib’s cult collaboration: dusty, off-kilter beats and dense, free-associative rhymes that became an underground touchstone.',
    stock: 5,
  },
  {
    slug: 'discovery',
    title: 'Discovery',
    artist: 'Daft Punk',
    genre: 'Electronic',
    releaseYear: 2001,
    priceCents: 2799,
    coverImage: cover('discovery'),
    description:
      'The robots’ neon-bright second album — filter-house anthems and vocoder hooks like "One More Time" and "Harder, Better, Faster, Stronger".',
    stock: 0,
  },
  {
    slug: 'nevermind',
    title: 'Nevermind',
    artist: 'Nirvana',
    genre: 'Rock',
    releaseYear: 1991,
    priceCents: 2899,
    coverImage: cover('nevermind'),
    description:
      'The record that dragged underground rock into the mainstream, pairing pop hooks with raw distortion on "Smells Like Teen Spirit" and beyond.',
    stock: 7,
  },
  {
    slug: 'rumours',
    title: 'Rumours',
    artist: 'Fleetwood Mac',
    genre: 'Rock',
    releaseYear: 1977,
    priceCents: 2999,
    coverImage: cover('rumours'),
    description:
      'Heartbreak turned into impossibly catchy soft-rock gold — a meticulously crafted, endlessly replayed pop masterpiece born from the band’s turmoil.',
    stock: 8,
  },
  {
    slug: 'songs-in-the-key-of-life',
    title: 'Songs in the Key of Life',
    artist: 'Stevie Wonder',
    genre: 'Soul',
    releaseYear: 1976,
    priceCents: 4299,
    coverImage: cover('songs-in-the-key-of-life'),
    description:
      'Stevie Wonder’s expansive double-album peak: joyous, ambitious soul spanning "Sir Duke", "I Wish", and "Isn’t She Lovely".',
    stock: 0,
  },
  {
    slug: 'the-dark-side-of-the-moon',
    title: 'The Dark Side of the Moon',
    artist: 'Pink Floyd',
    genre: 'Rock',
    releaseYear: 1973,
    priceCents: 3799,
    coverImage: cover('the-dark-side-of-the-moon'),
    description:
      'A seamless concept album on time, money, and madness — immaculate production and that iconic prism cover make it a perennial audiophile favorite.',
    stock: 1,
  },
  {
    slug: 'whats-going-on',
    title: "What's Going On",
    artist: 'Marvin Gaye',
    genre: 'Soul',
    releaseYear: 1971,
    priceCents: 3099,
    coverImage: cover('whats-going-on'),
    description:
      'Marvin Gaye’s lush, socially conscious song cycle on war, poverty, and the environment — soul music as protest and prayer.',
    stock: 9,
  },
  {
    slug: 'abbey-road',
    title: 'Abbey Road',
    artist: 'The Beatles',
    genre: 'Rock',
    releaseYear: 1969,
    priceCents: 3999,
    coverImage: cover('abbey-road'),
    description:
      'The Beatles’ polished final recording, famous for its side-two medley and the most-imitated album cover of all time.',
    stock: 3,
  },
  {
    slug: 'kind-of-blue',
    title: 'Kind of Blue',
    artist: 'Miles Davis',
    genre: 'Jazz',
    releaseYear: 1959,
    priceCents: 3499,
    coverImage: cover('kind-of-blue'),
    description:
      'The best-selling jazz album ever made: cool, modal, and effortlessly elegant, recorded almost entirely in first takes by an all-star sextet.',
    stock: 5,
  },
  {
    slug: 'blue-train',
    title: 'Blue Train',
    artist: 'John Coltrane',
    genre: 'Jazz',
    releaseYear: 1957,
    priceCents: 3199,
    coverImage: cover('blue-train'),
    description:
      'Coltrane’s only Blue Note date as leader — hard-bop with a soulful swing, anchored by the unforgettable title-track theme.',
    stock: 2,
  },
]

/** Tables truncated/seeded by the helpers below, in FK-safe order. */
const ALL_TABLES = ['order_line_items', 'orders', 'records']

/**
 * Plain-SQL statements that truncate every table and re-insert the canonical
 * catalog. Returned as strings (not driver calls) so the deploy script and the
 * test harness can submit them through the `neon-exec-sql-batch` allowlist verb.
 */
export function seedStatements(): string[] {
  const esc = (s: string) => `'${s.replace(/'/g, "''")}'`
  const truncate = `TRUNCATE ${ALL_TABLES.join(', ')} RESTART IDENTITY CASCADE`
  const inserts = RECORDS.map(
    (r) =>
      `INSERT INTO records (slug, title, artist, genre, release_year, price_cents, cover_image, description, stock) VALUES (` +
      `${esc(r.slug)}, ${esc(r.title)}, ${esc(r.artist)}, ${esc(r.genre)}, ${r.releaseYear}, ` +
      `${r.priceCents}, ${esc(r.coverImage)}, ${esc(r.description)}, ${r.stock})`,
  )
  return [truncate, ...inserts]
}

/** Insert the canonical catalog using the Neon serverless driver. */
export async function seedDatabase(databaseUrl: string): Promise<void> {
  const sql = neon(databaseUrl)
  for (const r of RECORDS) {
    await sql(
      `INSERT INTO records (slug, title, artist, genre, release_year, price_cents, cover_image, description, stock)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (slug) DO NOTHING`,
      [
        r.slug,
        r.title,
        r.artist,
        r.genre,
        r.releaseYear,
        r.priceCents,
        r.coverImage,
        r.description,
        r.stock,
      ],
    )
  }
}

/**
 * Reset the database to a known state: truncate all tables (resetting identity
 * sequences so record ids are stable across runs) then re-seed the catalog.
 * Used between tests so each test starts from the same dataset.
 */
export async function truncateAndSeed(databaseUrl: string): Promise<void> {
  const sql = neon(databaseUrl)
  await sql(`TRUNCATE ${ALL_TABLES.join(', ')} RESTART IDENTITY CASCADE`, [])
  await seedDatabase(databaseUrl)
}

/**
 * CLI entry: `npx tsx scripts/seed-db.ts`.
 *
 * Resets the database to the canonical catalog. Ensures the schema exists, then
 * truncates every table (resetting identity sequences so record ids stay stable
 * at 1..12) and re-inserts the 12 seed records — so the script is idempotent and
 * safe to re-run before tests or after a previous seed.
 *
 * Secrets are NOT in this process's env. When `DATABASE_URL` is present in the
 * environment (e.g. local dev, or a caller that exported it), we talk to Neon
 * directly via the serverless driver. Otherwise we shell out through
 * `exec-secrets DATABASE_URL -- neon-exec-sql-batch` (the same allowlist verb the
 * deploy script uses), which injects the branch secret without exposing it here.
 */
function execSecretsBatch(statements: string[]): void {
  execFileSync(
    'exec-secrets',
    ['DATABASE_URL', '--', 'neon-exec-sql-batch', JSON.stringify(statements)],
    { encoding: 'utf-8', timeout: 180_000, stdio: ['ignore', 'ignore', 'inherit'], env: { ...process.env, LC_ALL: 'C' } },
  )
}

async function main(): Promise<number> {
  const databaseUrl = process.env.DATABASE_URL
  if (databaseUrl) {
    // Direct driver path — DATABASE_URL is already in the environment.
    await initSchema(databaseUrl)
    await truncateAndSeed(databaseUrl)
  } else {
    // Container path — let exec-secrets inject the branch secret into the verb.
    execSecretsBatch([...schemaStatements, ...migrationStatements])
    execSecretsBatch(seedStatements())
  }
  console.log(`Seeded ${RECORDS.length} records (database reset to canonical catalog).`)
  return 0
}

/** True when this file is the process entry point (not imported by another script). */
function isMain(): boolean {
  try {
    return realpathSync(process.argv[1] ?? '') === realpathSync(fileURLToPath(import.meta.url))
  } catch {
    return false
  }
}

if (isMain()) {
  main()
    .then((code) => process.exit(code))
    .catch((err) => {
      console.error(`seed-db failed: ${err?.stack ?? String(err)}`)
      process.exit(1)
    })
}
