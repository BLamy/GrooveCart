import recordsJson from '../../public/data/records.json'
import type { RecordItem } from '../../src/types'

export interface CatalogRecord extends RecordItem {
  slug: string
}

const records = recordsJson as CatalogRecord[]

export function getCatalogRecords(): CatalogRecord[] {
  return records
}

export function findCatalogRecord(id: number): CatalogRecord | undefined {
  return records.find((record) => record.id === id)
}

export function priceCents(record: Pick<RecordItem, 'price'>): number {
  return Math.round(record.price * 100)
}
