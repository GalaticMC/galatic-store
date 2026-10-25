import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Home from './pages/Home';
import Store from './pages/Store';
import Categories from './pages/Categories';
import Cart from './pages/Cart';
import MyOrders from './pages/MyOrders';
import MyAccount from './pages/MyAccount';
import TopUp from './pages/TopUp';
import TopUpPayment from './pages/TopUpPayment';
import OrderDetails from './pages/OrderDetails';
import OrderCheckout from './pages/OrderCheckout';
import PaymentCheckout from './pages/PaymentCheckout';
import Admin from './pages/Admin';
import AdminAddGame from './pages/AdminAddGame';
import AdminEditGame from './pages/AdminEditGame';
import AdminCustomers from './pages/AdminCustomers';
import AdminEditCustomer from './pages/AdminEditCustomer';
import AdminCategories from './pages/AdminCategories';
import AdminOrders from './pages/AdminOrders';
import AdminOrderDetails from './pages/AdminOrderDetails';
import AdminCarts from './pages/AdminCarts';
import AdminTopUps from './pages/AdminTopUps';

export default function App() {
  const isAdminSubdomain = window.location.hostname.startsWith('admin');

  return (
    <BrowserRouter>
      <Toaster position="top-center" toastOptions={{ style: { background: '#021a2b', color: '#ffebc2', border: '1px solid #416f9f' } }} />
      <Routes>
        {isAdminSubdomain ? (
          <>
            {/* Admin Login Route */}
            <Route path="/login" element={<Login />} />
            
            {/* Admin Routes */}
            <Route path="/" element={<Admin />} />
            <Route path="/add-game" element={<AdminAddGame />} />
            <Route path="/edit-game/:id" element={<AdminEditGame />} />
            <Route path="/categories" element={<AdminCategories />} />
            <Route path="/customers" element={<AdminCustomers />} />
            <Route path="/customers/edit/:id" element={<AdminEditCustomer />} />
            <Route path="/orders" element={<AdminOrders />} />
            <Route path="/orders/:orderId" element={<AdminOrderDetails />} />
            <Route path="/carts" element={<AdminCarts />} />
            <Route path="/topups" element={<AdminTopUps />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        ) : (
          <>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/games" element={<Store />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/orders" element={<MyOrders />} />
            <Route path="/account" element={<MyAccount />} />
            <Route path="/topup" element={<TopUp />} />
            <Route path="/topup/:requestId" element={<TopUpPayment />} />
            <Route path="/orders/:orderId" element={<OrderDetails />} />
            <Route path="/checkout/:orderId" element={<OrderCheckout />} />
            <Route path="/pay/:orderId" element={<PaymentCheckout />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}