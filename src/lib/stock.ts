/** Low-stock threshold: at or below this (and above 0) shows "Only N left". */
export const LOW_STOCK_THRESHOLD = 5

export type StockLevel = 'in-stock' | 'low-stock' | 'sold-out'

/** Classify a record's stock quantity into a display level. */
export function stockLevel(stock: number): StockLevel {
  if (stock <= 0) return 'sold-out'
  if (stock <= LOW_STOCK_THRESHOLD) return 'low-stock'
  return 'in-stock'
}

/** Short availability label derived from the stock quantity. */
export function stockLabel(stock: number): string {
  switch (stockLevel(stock)) {
    case 'sold-out':
      return 'Sold out'
    case 'low-stock':
      return `Only ${stock} left`
    default:
      return 'In stock'
  }
}

/** Longer, informative availability detail shown in the StockStatus tooltip. */
export function stockDetail(stock: number): string {
  switch (stockLevel(stock)) {
    case 'sold-out':
      return 'Currently sold out — check back later'
    case 'low-stock':
      return `Only ${stock} ${stock === 1 ? 'copy' : 'copies'} remaining — order soon`
    default:
      return `${stock} copies in stock`
  }
}
