interface OrderTotalsProps {
  total: number
}

/**
 * The total amount paid for the order, displayed prominently beneath the
 * line-item list.
 */
export default function OrderTotals({ total }: OrderTotalsProps) {
  return (
    <div
      className="flex items-center justify-between border-t border-border pt-4"
      data-testid="order-totals"
    >
      <span className="text-base font-semibold text-text">Total paid</span>
      <span className="text-2xl font-extrabold text-text" data-testid="order-total">
        ${total.toFixed(2)}
      </span>
    </div>
  )
}
