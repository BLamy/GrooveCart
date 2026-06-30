import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/navigation/SiteFooter'
import AuthProviderButtons from '../components/AuthProviderButtons'

export default function Login() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--gc-bg)]">
      <SiteHeader />
      <main className="mx-auto grid w-full max-w-[var(--gc-max-width)] flex-1 items-center px-4 py-10 sm:px-6">
        <section className="mx-auto w-full max-w-md">
          <div className="mb-6">
            <p className="text-sm font-bold uppercase tracking-[0.08em] text-[var(--gc-accent)]">
              Account
            </p>
            <h1 className="mt-2 text-2xl font-extrabold text-[var(--gc-text)]">
              Sign in to GrooveCart
            </h1>
            <p className="mt-2 text-sm text-[var(--gc-text-muted)]">
              Choose an identity provider to continue.
            </p>
          </div>
          <AuthProviderButtons />
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
