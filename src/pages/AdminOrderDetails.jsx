import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import toast from 'react-hot-toast';
import AdminSidebar from '../components/AdminSidebar';
import { ArrowLeft, Save, ShoppingCart, User, Calendar, DollarSign } from 'lucide-react';

export default function AdminOrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const docRef = doc(db, "orders", orderId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setOrder({ id: docSnap.id, ...data });
          setStatus(data.status || 'Unpaid');
        } else {
          toast.error("Order not found!");
          navigate('/orders');
        }
      } catch (error) {
        toast.error("Failed to load order.");
      }
      setLoading(false);
    };
    fetchOrder();
  }, [orderId, navigate]);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { status: status });
      toast.success("Order status updated!");
      navigate('/orders');
    } catch (error) {
      toast.error("Failed to update order status.");
    }
    setSaving(false);
  };

  if (loading) return <div className="min-h-screen bg-galatic-navy text-white flex items-center justify-center">Loading...</div>;
  if (!order) return null;

  const orderDate = order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString() : 'N/A';

  return (
    <div className="flex min-h-screen bg-galatic-navy text-white">
      <AdminSidebar />
      <div className="ml-64 flex-1 p-8">
        <button onClick={() => navigate('/orders')} className="flex items-center gap-2 text-galatic-sky hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-5 h-5" /> Back to Orders
        </button>

        <div className="bg-galatic-slate/20 border border-galatic-slate/50 rounded-2xl p-8 max-w-4xl">
          <div className="flex justify-between items-start mb-8 border-b border-galatic-slate/30 pb-6">
            <div>
              <h1 className="text-3xl font-bold text-galatic-cream mb-2 flex items-center gap-3">
                <ShoppingCart className="w-8 h-8" /> Order Details
              </h1>
              <p className="text-galatic-sky/70 text-sm">Order ID: {order.id}</p>
            </div>
            
            <form onSubmit={handleUpdateStatus} className="flex flex-col items-end gap-3">
              <label className="text-sm font-bold text-galatic-sky">Update Status:</label>
              <div className="flex gap-2">
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="bg-galatic-navy border border-galatic-slate rounded-lg p-2 text-white focus:outline-none focus:border-galatic-sky">
                  <option value="Unpaid">Unpaid</option>
                  <option value="Paid">Paid</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Completed">Completed</option>
                </select>
                <button type="submit" disabled={saving} className="bg-galatic-cream text-galatic-navy px-4 py-2 rounded-lg font-bold hover:bg-white transition-all flex items-center gap-2">
                  <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Update'}
                </button>
              </div>
            </form>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-galatic-navy/50 p-4 rounded-xl border border-galatic-slate/30">
              <p className="text-galatic-sky/70 text-sm mb-1 flex items-center gap-2"><User className="w-4 h-4"/> Customer</p>
              <p className="font-bold text-white truncate">{order.userEmail}</p>
            </div>
            <div className="bg-galatic-navy/50 p-4 rounded-xl border border-galatic-slate/30">
              <p className="text-galatic-sky/70 text-sm mb-1 flex items-center gap-2"><Calendar className="w-4 h-4"/> Date</p>
              <p className="font-bold text-white">{orderDate}</p>
            </div>
            <div className="bg-galatic-navy/50 p-4 rounded-xl border border-galatic-slate/30">
              <p className="text-galatic-sky/70 text-sm mb-1 flex items-center gap-2"><DollarSign className="w-4 h-4"/> Total Amount</p>
              <p className="font-bold text-green-400 text-xl">৳{order.totalAmount}</p>
            </div>
          </div>

          <h2 className="text-xl font-bold text-white mb-4">Items Ordered</h2>
          <div className="space-y-3">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 bg-galatic-navy/50 p-4 rounded-xl border border-galatic-slate/30">
                <img src={item.image} alt={item.title} className="w-16 h-16 rounded object-cover" />
                <div className="flex-1">
                  <p className="text-white font-bold text-lg">{item.title}</p>
                  <p className="text-galatic-sky/70 text-sm">{item.category}</p>
                </div>
                <span className="text-galatic-cream font-bold text-lg">৳{item.price}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}