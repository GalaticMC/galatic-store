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
import TopUpPayment from './pages/TopUpPayment'; // NEW IMPORT
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
import AdminTopUps from './pages/AdminTopUps'; // NEW IMPORT

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" toastOptions={{ style: { background: '#021a2b', color: '#ffebc2', border: '1px solid #416f9f' } }} />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/add-game" element={<AdminAddGame />} />
        <Route path="/admin/edit-game/:id" element={<AdminEditGame />} />
        <Route path="/admin/categories" element={<AdminCategories />} />
        <Route path="/admin/customers" element={<AdminCustomers />} />
        <Route path="/admin/customers/edit/:id" element={<AdminEditCustomer />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/orders/:orderId" element={<AdminOrderDetails />} />
        <Route path="/admin/carts" element={<AdminCarts />} />
        <Route path="/admin/topups" element={<AdminTopUps />} /> {/* NEW ROUTE */}
        
        {/* Store Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/store" element={<Home />} />
        <Route path="/store/games" element={<Store />} />
        <Route path="/store/categories" element={<Categories />} />
        <Route path="/store/cart" element={<Cart />} />
        <Route path="/store/orders" element={<MyOrders />} />
        <Route path="/store/account" element={<MyAccount />} />
        <Route path="/store/topup" element={<TopUp />} />
        <Route path="/store/topup/:requestId" element={<TopUpPayment />} /> {/* NEW ROUTE */}
        <Route path="/store/orders/:orderId" element={<OrderDetails />} />
        <Route path="/store/checkout/:orderId" element={<OrderCheckout />} />
        <Route path="/store/pay/:orderId" element={<PaymentCheckout />} />
        
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}