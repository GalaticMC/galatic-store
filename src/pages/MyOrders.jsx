import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { ShoppingBag, Package, Calendar, Loader } from 'lucide-react';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let unsubscribeOrders = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate('/login');
        return;
      }

      const ordersRef = collection(db, "orders");
      const q = query(ordersRef, where("userId", "==", user.uid));
      
      unsubscribeOrders = onSnapshot(q, (querySnapshot) => {
        const userOrders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        userOrders.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
        setOrders(userOrders);
        setLoading(false);
      });
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeOrders) unsubscribeOrders();
    };
  }, [navigate]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
      case 'Paid':
        return 'bg-green-400/20 text-green-400';
      case 'Unpaid':
        return 'bg-orange-400/20 text-orange-400';
      case 'Cancelled':
        return 'bg-red-400/20 text-red-400';
      default:
        return 'bg-galatic-slate text-galatic-sky';
    }
  };

  if (loading) return (
    <div className="flex min-h-screen bg-galatic-navy text-white">
      <Sidebar />
      <div className="ml-64 flex-1 flex items-center justify-center">
        <div className="flex items-center gap-3 text-galatic-cream text-xl">
          <Loader className="w-6 h-6 animate-spin" /> Loading your orders...
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-galatic-navy text-galatic-sky">
      <Sidebar />
      
      <main className="ml-64 flex-1 p-8">
        <h1 className="text-3xl font-bold text-galatic-cream mb-8 flex items-center gap-3">
          <ShoppingBag className="w-8 h-8" /> My Orders
        </h1>

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-galatic-slate/10 rounded-2xl border border-galatic-slate/20">
            <Package className="w-16 h-16 text-galatic-slate mx-auto mb-4" />
            <p className="text-galatic-sky text-xl mb-4">You haven't placed any orders yet.</p>
            <Link to="/" className="text-galatic-cream hover:underline">Start Shopping &rarr;</Link>
          </div>
        ) : (
          <div className="space-y-4 max-w-4xl">
            {orders.map((order) => {
              const orderDate = order.createdAt?.toDate 
                ? order.createdAt.toDate().toLocaleDateString() 
                : 'N/A';

              return (
                <div 
                  key={order.id} 
                  onClick={() => navigate(`/orders/${order.id}`)} // FIXED LINK
                  className="bg-galatic-slate/20 border border-galatic-slate/50 rounded-2xl p-6 cursor-pointer hover:bg-galatic-slate/30 hover:border-galatic-sky/50 transition-all duration-200 group"
                >
                  <div className="flex justify-between items-start mb-4 border-b border-galatic-slate/30 pb-4">
                    <div>
                      <p className="text-white font-bold text-lg">Order #{order.id.slice(-6).toUpperCase()}</p>
                      <p className="text-sm text-galatic-sky/70 flex items-center gap-2 mt-1">
                        <Calendar className="w-4 h-4" /> {orderDate}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-400">৳{order.totalAmount}</p>
                      <span className={`inline-block mt-1 px-3 py-1 rounded text-xs font-bold ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 bg-galatic-navy/50 p-3 rounded-xl group-hover:bg-galatic-navy/70 transition-colors">
                        <img src={item.image} alt={item.title} className="w-12 h-12 rounded object-cover" />
                        <div className="flex-1">
                          <p className="text-white font-bold text-sm">{item.title}</p>
                          <p className="text-galatic-sky/70 text-xs">{item.category}</p>
                        </div>
                        <span className="text-galatic-cream font-bold">৳{item.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}