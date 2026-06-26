import { Routes, Route } from 'react-router-dom'
import Storefront from './pages/Storefront'
import RecordDetail from './pages/RecordDetail'
import Cart from './pages/Cart'
import OrderConfirmation from './pages/OrderConfirmation'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Storefront />} />
      <Route path="/records/:id" element={<RecordDetail />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/order/confirmation" element={<OrderConfirmation />} />
    </Routes>
  )
}
