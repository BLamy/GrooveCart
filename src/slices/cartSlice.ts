import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'

/**
 * A single line in the cart. The cart only persists the record id and the
 * chosen quantity — authoritative record details (title, price, stock) are
 * always re-read from the static catalog so prices and stock bounds stay
 * correct even if the catalog changes.
 */
export interface CartItem {
  recordId: number
  quantity: number
}

export interface CartState {
  items: CartItem[]
  /** Whether the slide-in CartDrawer is open. */
  drawerOpen: boolean
  /**
   * The most recent line-item removal, used to drive the transient
   * `RemovedItemBanner`. `seq` increments on every removal so the banner can
   * re-trigger (resetting its auto-dismiss timer) even when the same title is
   * removed twice in a row. Cleared to `null` on manual dismiss.
   */
  lastRemoved: { title: string; seq: number } | null
}

const STORAGE_KEY = 'groovecart.cart'

function loadItems(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(
        (i): i is CartItem =>
          i != null &&
          typeof i.recordId === 'number' &&
          typeof i.quantity === 'number' &&
          i.quantity > 0,
      )
      .map((i) => ({ recordId: i.recordId, quantity: i.quantity }))
  } catch {
    return []
  }
}

function persistItems(items: CartItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // Ignore persistence failures (e.g. storage disabled); cart still works in-memory.
  }
}

const initialState: CartState = {
  items: loadItems(),
  drawerOpen: false,
  lastRemoved: null,
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    /** Add `quantity` copies of a record, merging with any existing line. */
    addItem(state, action: PayloadAction<{ recordId: number; quantity?: number }>) {
      const { recordId, quantity = 1 } = action.payload
      const existing = state.items.find((i) => i.recordId === recordId)
      if (existing) {
        existing.quantity += quantity
      } else {
        state.items.push({ recordId, quantity })
      }
      persistItems(state.items)
    },
    /** Set the absolute quantity of a line; removes the line when <= 0. */
    setQuantity(state, action: PayloadAction<{ recordId: number; quantity: number }>) {
      const { recordId, quantity } = action.payload
      const existing = state.items.find((i) => i.recordId === recordId)
      if (!existing) return
      if (quantity <= 0) {
        state.items = state.items.filter((i) => i.recordId !== recordId)
      } else {
        existing.quantity = quantity
      }
      persistItems(state.items)
    },
    /**
     * Remove a line entirely. The removed record's `title` is carried in the
     * payload so the `RemovedItemBanner` can name it without re-reading the
     * (now-gone) line from the catalog.
     */
    removeItem(state, action: PayloadAction<{ recordId: number; title: string }>) {
      const { recordId, title } = action.payload
      const existed = state.items.some((i) => i.recordId === recordId)
      state.items = state.items.filter((i) => i.recordId !== recordId)
      if (existed) {
        state.lastRemoved = { title, seq: (state.lastRemoved?.seq ?? 0) + 1 }
      }
      persistItems(state.items)
    },
    /** Clear the transient removal confirmation (manual dismiss of the banner). */
    dismissRemoval(state) {
      state.lastRemoved = null
    },
    clearCart(state) {
      state.items = []
      persistItems(state.items)
    },
    openDrawer(state) {
      state.drawerOpen = true
    },
    closeDrawer(state) {
      state.drawerOpen = false
    },
    toggleDrawer(state) {
      state.drawerOpen = !state.drawerOpen
    },
  },
})

export const {
  addItem,
  setQuantity,
  removeItem,
  dismissRemoval,
  clearCart,
  openDrawer,
  closeDrawer,
  toggleDrawer,
} = cartSlice.actions

export default cartSlice.reducer

/* ---- selectors ---- */

export const selectCartItems = (state: RootState): CartItem[] => state.cart.items

/** Total quantity across all line items (drives the header cart badge). */
export const selectCartCount = (state: RootState): number =>
  state.cart.items.reduce((n, i) => n + i.quantity, 0)

export const selectDrawerOpen = (state: RootState): boolean => state.cart.drawerOpen

export const selectLastRemoved = (state: RootState): CartState['lastRemoved'] =>
  state.cart.lastRemoved
