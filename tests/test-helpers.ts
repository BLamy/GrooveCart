/**
 * Shared test helpers.
 *
 * The catalog is static JSON, so there is no database state to reset between
 * specs. These exports remain as compatibility no-ops for older generated tests.
 */
export const branchDbUrl = ''

export async function truncateAndSeed(): Promise<void> {
  return Promise.resolve()
}
