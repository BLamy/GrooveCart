import { Minus, Plus } from 'lucide-react'

interface QuantityStepperProps {
  /** The current quantity. */
  value: number
  /** Maximum selectable value (e.g. the record's available stock). */
  max: number
  /** Minimum selectable value; defaults to 1 (the Cart uses a separate remove action). */
  min?: number
  /** Called with the next value when the shopper increments or decrements. */
  onChange: (next: number) => void
  /** Accessible label for the control group. */
  label?: string
  /** Compact variant for dense surfaces like the CartDrawer. */
  size?: 'sm' | 'md'
}

/**
 * Reusable increment/decrement control. The value is floored at `min` (default
 * 1) and capped at `max`. At the floor the "−" button is disabled; at the cap the
 * "+" button is disabled; if the cap is below the floor (no stock) the whole
 * control is disabled.
 */
export default function QuantityStepper({
  value,
  max,
  min = 1,
  onChange,
  label = 'Quantity',
  size = 'md',
}: QuantityStepperProps) {
  const noCapacity = max < min
  const canDecrement = !noCapacity && value > min
  const canIncrement = !noCapacity && value < max

  const btn =
    size === 'sm'
      ? 'h-7 w-7'
      : 'h-9 w-9'
  const valueBox = size === 'sm' ? 'min-w-7 text-sm' : 'min-w-9'
  const icon = size === 'sm' ? 14 : 16

  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex items-center rounded-[var(--gc-radius-control)] border border-[var(--gc-border)] bg-[var(--gc-surface)]"
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={!canDecrement}
        onClick={() => canDecrement && onChange(value - 1)}
        className={`grid ${btn} place-items-center text-[var(--gc-text)] transition-colors hover:text-[var(--gc-accent)] disabled:cursor-not-allowed disabled:text-[var(--gc-border)] disabled:hover:text-[var(--gc-border)]`}
      >
        <Minus size={icon} />
      </button>
      <span
        aria-live="polite"
        className={`grid ${valueBox} place-items-center px-1 font-semibold tabular-nums`}
      >
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={!canIncrement}
        onClick={() => canIncrement && onChange(value + 1)}
        className={`grid ${btn} place-items-center text-[var(--gc-text)] transition-colors hover:text-[var(--gc-accent)] disabled:cursor-not-allowed disabled:text-[var(--gc-border)] disabled:hover:text-[var(--gc-border)]`}
      >
        <Plus size={icon} />
      </button>
    </div>
  )
}
