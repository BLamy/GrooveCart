import { useEffect, useState } from 'react'
import { CheckCircle2, X } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../store'
import { dismissRemoval, selectLastRemoved } from '../../slices/cartSlice'

const AUTO_DISMISS_MS = 4000

/**
 * Transient confirmation shown after a line item is removed, naming the removed
 * record. It appears whenever a new removal happens (keyed on the removal `seq`,
 * so it re-triggers and reflects the most recent removal), auto-dismisses after
 * a short delay, and exposes a manual dismiss control. It never mutates the cart
 * — it only confirms a removal that already happened.
 */
export default function RemovedItemBanner() {
  const dispatch = useAppDispatch()
  const lastRemoved = useAppSelector(selectLastRemoved)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!lastRemoved) {
      setVisible(false)
      return
    }
    setVisible(true)
    const timer = setTimeout(() => setVisible(false), AUTO_DISMISS_MS)
    return () => clearTimeout(timer)
  }, [lastRemoved])

  if (!lastRemoved || !visible) return null

  return (
    <div
      role="status"
      data-testid="removed-item-banner"
      className="mb-4 flex items-center gap-3 rounded-[var(--gc-radius-control)] border border-[var(--gc-border)] bg-[var(--gc-surface)] px-4 py-3 text-sm text-[var(--gc-text)] shadow-[var(--gc-shadow-card)]"
    >
      <CheckCircle2 size={18} className="shrink-0 text-[var(--gc-success)]" />
      <span className="flex-1">
        Removed &ldquo;{lastRemoved.title}&rdquo; from your cart
      </span>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => {
          setVisible(false)
          dispatch(dismissRemoval())
        }}
        className="shrink-0 text-[var(--gc-text-muted)] transition-colors hover:text-[var(--gc-text)]"
      >
        <X size={16} />
      </button>
    </div>
  )
}
