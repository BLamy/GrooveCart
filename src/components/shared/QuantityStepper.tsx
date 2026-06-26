import { Minus, Plus } from 'lucide-react'

interface QuantityStepperProps {
  /** Current quantity value. */
  value: number
  /** Maximum selectable quantity (the available/purchasable stock cap). */
  max: number
  /** Called with the next value when the user increments/decrements. */
  onChange: (next: number) => void
  /** Lower bound; defaults to 1 (the Cart provides a separate remove action). */
  min?: number
  /** Force-disable the whole control regardless of bounds. */
  disabled?: boolean
  testId?: string
}

/**
 * Reusable increment/decrement quantity control used on RecordDetail (to choose
 * how many to add) and on each CartLineItem (to adjust a line's quantity).
 *
 * The value is floored at `min` (default 1) and capped at `max`. The "−" button
 * is disabled at the floor and the "+" button at the cap; when the cap is below
 * the floor (e.g. a sold-out record or all stock already in the cart) the whole
 * stepper is disabled.
 */
export default function QuantityStepper({
  value,
  max,
  onChange,
  min = 1,
  disabled = false,
  testId = 'quantity-stepper',
}: QuantityStepperProps) {
  const capReached = max < min
  const fullyDisabled = disabled || capReached
  const canDecrement = !fullyDisabled && value > min
  const canIncrement = !fullyDisabled && value < max

  const buttonClass =
    'flex h-9 w-9 items-center justify-center rounded-control text-text transition-colors ' +
    'hover:bg-surface-muted disabled:cursor-not-allowed disabled:text-text-muted disabled:opacity-40 ' +
    'disabled:hover:bg-transparent'

  return (
    <div
      data-testid={testId}
      className="inline-flex items-center gap-1 rounded-control border border-border bg-surface p-1"
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        data-testid="quantity-decrement"
        className={buttonClass}
        disabled={!canDecrement}
        onClick={() => canDecrement && onChange(value - 1)}
      >
        <Minus size={16} strokeWidth={2.5} />
      </button>
      <span
        data-testid="quantity-value"
        aria-live="polite"
        className="min-w-8 text-center text-base font-semibold tabular-nums"
      >
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        data-testid="quantity-increment"
        className={buttonClass}
        disabled={!canIncrement}
        onClick={() => canIncrement && onChange(value + 1)}
      >
        <Plus size={16} strokeWidth={2.5} />
      </button>
    </div>
  )
}
