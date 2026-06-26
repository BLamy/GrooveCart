import { useEffect, useState } from 'react'
import type { RecordItem } from '../../types'
import { useAppDispatch, useAppSelector } from '../../store'
import { addItem, openDrawer } from '../../slices/cartSlice'
import RecordInfo from './RecordInfo'
import PriceBlock from './PriceBlock'
import AddToCartButton from './AddToCartButton'
import QuantityStepper from '../shared/QuantityStepper'

interface PurchasePanelProps {
  record: RecordItem
}

/**
 * Right-hand purchase panel of the RecordDetail page. Composes the descriptive
 * info, price + stock status, the quantity stepper, and the Add to Cart CTA.
 *
 * It reads the quantity of this record already in the cart to compute the
 * remaining purchasable quantity (`stock − inCart`), which caps the stepper and
 * governs whether the CTA is enabled — so the cart can never exceed total stock.
 */
export default function PurchasePanel({ record }: PurchasePanelProps) {
  const dispatch = useAppDispatch()
  const inCart = useAppSelector(
    (s) => s.cart.items.find((i) => i.recordId === record.id)?.quantity ?? 0,
  )
  const remaining = Math.max(0, record.stock - inCart)
  const purchasable = remaining > 0

  const [quantity, setQuantity] = useState(1)

  // Reset the selected quantity to 1 whenever we switch to a different record.
  useEffect(() => {
    setQuantity(1)
  }, [record.id])

  // Keep the selected quantity within the remaining purchasable bound (e.g.
  // after adding to cart consumes stock).
  useEffect(() => {
    setQuantity((q) => Math.min(Math.max(q, 1), Math.max(1, remaining)))
  }, [remaining])

  function handleAdd() {
    if (!purchasable) return
    const amount = Math.min(quantity, remaining)
    dispatch(addItem({ recordId: record.id, quantity: amount }))
    dispatch(openDrawer())
  }

  return (
    <div data-testid="purchase-panel" className="flex flex-col gap-6">
      <RecordInfo
        title={record.title}
        artist={record.artist}
        genre={record.genre}
        releaseYear={record.releaseYear}
        description={record.description}
      />
      <PriceBlock price={record.price} stock={record.stock} />
      <div className="flex flex-col gap-3">
        <span className="text-sm font-medium text-text-muted">Quantity</span>
        <QuantityStepper
          value={quantity}
          max={remaining}
          onChange={setQuantity}
          disabled={!purchasable}
        />
      </div>
      <AddToCartButton purchasable={purchasable} onAdd={handleAdd} />
    </div>
  )
}
