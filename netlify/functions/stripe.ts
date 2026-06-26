import Stripe from 'stripe'

/**
 * Shared Stripe client for the GrooveCart Netlify Functions.
 *
 * In production the client talks to the real Stripe API using
 * `STRIPE_SECRET_KEY`. In Playwright tests the Stripe flow is emulated with
 * `vercel-labs/emulate` (`npx emulate --service stripe`): the harness sets
 * `STRIPE_API_BASE` to the emulator's base URL (e.g. `http://localhost:4009`)
 * and the SDK is pointed at that host/port so no real charge is ever made. The
 * emulator does not validate the API key, so a placeholder key is fine there.
 *
 * The client is cached per warm Lambda so we don't reconstruct it per request.
 */
let cached: Stripe | null = null

export function getStripe(): Stripe {
  if (cached) return cached

  const apiKey = process.env.STRIPE_SECRET_KEY || 'sk_test_emulated'
  const config: NonNullable<ConstructorParameters<typeof Stripe>[1]> = {}

  // Point the SDK at the local emulator when `STRIPE_API_BASE` is set.
  const base = process.env.STRIPE_API_BASE
  if (base) {
    try {
      const url = new URL(base)
      config.host = url.hostname
      config.protocol = url.protocol.replace(':', '') as 'http' | 'https'
      if (url.port) config.port = Number(url.port)
    } catch {
      // Ignore a malformed base URL and fall back to the real Stripe host.
    }
  }

  cached = new Stripe(apiKey, config)
  return cached
}
