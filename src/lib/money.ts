/** Format an integer number of cents as a USD currency string (e.g. 2400 → "$24.00"). */
export function formatCents(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}
