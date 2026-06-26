/**
 * Format a dollar amount as a US-style price string, e.g. `32.99` → `"$32.99"`.
 * Prices always render with two decimal places so trailing zeros are preserved.
 */
export function formatPrice(dollars: number): string {
  return `$${dollars.toFixed(2)}`
}
