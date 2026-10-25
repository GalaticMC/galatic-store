import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import { ArrowLeft, ShoppingCart, Calendar, DollarSign, Package, CreditCard, RefreshCw, Mail } from 'lucide-react';

export default function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const docRef = doc(db, "orders", orderId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.userId !== auth.currentUser.uid) {
            toast.error("You do not have permission to view this order.");
            navigate('/orders'); // FIXED
            return;
          }
          setOrder({ id: docSnap.id, ...data });
        } else {
          toast.error("Order not found!");
          navigate('/orders'); // FIXED
        }
      } catch (error) {
        console.error("Error fetching order: ", error);
      }
      setLoading(false);
    };
    
    if (auth.currentUser) fetchOrder();
  }, [orderId, navigate]);

  const handleOrderAgain = async () => {
    setProcessing(true);
    try {
      for (const item of order.items) {
        await setDoc(doc(db, `carts/${auth.currentUser.uid}/items`, item.gameId), {
          gameId: item.gameId,
          title: item.title,
          price: item.price,
          image: item.image,
          category: item.category
        });
      }
      toast.success("Items added back to your cart!");
      navigate('/cart'); // FIXED
    } catch (error) {
      toast.error("Failed to add items back to cart.");
    }
    setProcessing(false);
  };

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
      <div className="ml-64 flex-1 flex items-center justify-center">Loading order details...</div>
    </div>
  );

  if (!order) return null;

  const orderDate = order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString() : 'N/A';

  return (
    <div className="flex min-h-screen bg-galatic-navy text-white">
      <Sidebar />

      <div className="ml-64 flex-1 p-8">
        <button 
          onClick={() => navigate('/orders')} // FIXED
          className="flex items-center gap-2 text-galatic-sky hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Back to My Orders
        </button>

        <div className="bg-galatic-slate/20 border border-galatic-slate/50 rounded-2xl p-8 max-w-4xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-galatic-slate/30 pb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-galatic-cream mb-2 flex items-center gap-3">
                <ShoppingCart className="w-8 h-8" /> Order Details
              </h1>
              <p className="text-galatic-sky/70 text-sm">Order ID: {order.id}</p>
            </div>
            
            <div className="flex flex-col items-end gap-3">
              <span className={`inline-block px-4 py-2 rounded text-sm font-bold ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
              
              {order.status === 'Unpaid' && (
                <button 
                  onClick={() => navigate(`/checkout/${order.id}`)} // FIXED
                  className="bg-green-500 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-green-400 transition-colors shadow-lg"
                >
                  <CreditCard className="w-5 h-5" /> Pay Now
                </button>
              )}

              {order.status === 'Cancelled' && (
                <button 
                  onClick={handleOrderAgain}
                  disabled={processing}
                  className="bg-galatic-cream text-galatic-navy px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-white transition-colors shadow-lg"
                >
                  <RefreshCw className="w-5 h-5" /> {processing ? 'Adding...' : 'Order Again'}
                </button>
              )}
            </div>
          </div>

          {order.status === 'Paid' && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 mb-8 flex items-start gap-4">
              <div className="p-3 bg-green-500/20 rounded-full text-green-400">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-green-400 mb-1">Payment Successful!</h3>
                <p className="text-galatic-sky/90 text-sm leading-relaxed">
                  Your account credentials and game keys will be sent to your email address (<span className="font-bold text-white">{auth.currentUser?.email}</span>) within the next <span className="font-bold text-white">1 hour</span>. 
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-galatic-navy/50 p-4 rounded-xl border border-galatic-slate/30">
              <p className="text-galatic-sky/70 text-sm mb-1 flex items-center gap-2"><Calendar className="w-4 h-4"/> Date Placed</p>
              <p className="font-bold text-white">{orderDate}</p>
            </div>
            <div className="bg-galatic-navy/50 p-4 rounded-xl border border-galatic-slate/30">
              <p className="text-galatic-sky/70 text-sm mb-1 flex items-center gap-2"><DollarSign className="w-4 h-4"/> Total Amount</p>
              <p className="font-bold text-green-400 text-xl">৳{order.totalAmount}</p>
            </div>
          </div>

          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Package className="w-5 h-5" /> Items Ordered
          </h2>
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