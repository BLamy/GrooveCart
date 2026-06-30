import {
  Apple,
  Building2,
  Chrome,
  KeyRound,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react'
import { AUTH_PROVIDERS, type AuthProviderId } from '../lib/authProviders'

const ICONS: Record<AuthProviderId, LucideIcon> = {
  microsoft: Building2,
  apple: Apple,
  google: Chrome,
  clerk: KeyRound,
  okta: ShieldCheck,
}

export default function AuthProviderButtons() {
  return (
    <div className="grid gap-3">
      {AUTH_PROVIDERS.map((provider) => {
        const Icon = ICONS[provider.id]
        return (
          <a
            key={provider.id}
            href={provider.loginPath}
            data-testid={`auth-provider-${provider.id}`}
            className="inline-flex min-h-12 items-center justify-center gap-3 rounded-[var(--gc-radius-control)] border border-[var(--gc-border)] bg-[var(--gc-surface)] px-4 py-3 text-sm font-bold text-[var(--gc-text)] shadow-[var(--gc-shadow-card)] transition-colors hover:border-[var(--gc-accent)] hover:text-[var(--gc-accent)]"
          >
            <Icon size={18} aria-hidden="true" />
            <span>{provider.label}</span>
          </a>
        )
      })}
    </div>
  )
}
