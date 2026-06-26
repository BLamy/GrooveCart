interface AddToCartButtonProps {
  /** Whether the record can currently be purchased (stock remains to add). */
  purchasable: boolean
  /** Add the currently selected quantity to the cart. */
  onAdd: () => void
}

/**
 * Primary purchase CTA. When the record is purchasable it reads "Add to Cart"
 * and adds the selected quantity. When the record is out of stock — or the cart
 * already holds all available stock — it is disabled and labeled "Sold Out".
 */
export default function AddToCartButton({ purchasable, onAdd }: AddToCartButtonProps) {
  return (
    <button
      type="button"
      data-testid="add-to-cart-button"
      disabled={!purchasable}
      onClick={() => purchasable && onAdd()}
      className="flex w-full items-center justify-center rounded-control bg-accent px-6 py-3.5 text-base font-semibold text-white shadow-card transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:bg-soldout disabled:shadow-none"
    >
      {purchasable ? 'Add to Cart' : 'Sold Out'}
    </button>
  )
}
