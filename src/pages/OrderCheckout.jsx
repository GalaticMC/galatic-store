import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import { ArrowLeft, Wallet, ShoppingCart, CheckCircle } from 'lucide-react';

export default function OrderCheckout() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [userBalance, setUserBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch User Profile for Balance
        const userRef = doc(db, "users", auth.currentUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const data = userSnap.data();
          const cleanBalance = data.totalSpent ? parseFloat(data.totalSpent.replace(/[^0-9.]/g, '')) : 0;
          setUserBalance(cleanBalance || 0);
        }

        // 2. Fetch Order Details
        const orderRef = doc(db, "orders", orderId);
        const orderSnap = await getDoc(orderRef);
        
        if (orderSnap.exists()) {
          const orderData = orderSnap.data();
          if (orderData.userId !== auth.currentUser.uid) {
            toast.error("Unauthorized access.");
            navigate('/store/orders');
            return;
          }
          if (orderData.status === 'Paid') {
            toast.success("This order is already paid.");
            navigate(`/store/orders/${orderId}`);
            return;
          }
          setOrder({ id: orderSnap.id, ...orderData });
        } else {
          toast.error("Order not found!");
          navigate('/store/orders');
        }

      } catch (error) {
        console.error("Error fetching data: ", error);
        toast.error("Failed to load checkout details.");
      } finally {
        setLoading(false);
      }
    };

    if (auth.currentUser) fetchData();
  }, [orderId, navigate]);

  const handlePayment = async () => {
    if (!order) return;
    
    const orderCost = parseFloat(order.totalAmount);
    
    if (userBalance < orderCost) {
      toast.error("Insufficient balance! Please top up your wallet.");
      return;
    }

    setProcessing(true);
    const loadingToast = toast.loading("Processing payment...");

    try {
      // 1. Deduct balance from user
      const newBalance = userBalance - orderCost;
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, {
        totalSpent: `৳${newBalance.toLocaleString()}`
      });

      // 2. Update Order Status to Paid
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { status: 'Paid' });

      // 3. Success
      toast.success(`Payment of ৳${orderCost} successful!`, { id: loadingToast });
      
      // 4. Redirect back to order details after a short delay
      setTimeout(() => {
        navigate(`/store/orders/${orderId}`);
      }, 1000);

    } catch (error) {
      console.error("Payment error: ", error);
      toast.error("Payment failed. Please try again.", { id: loadingToast });
      setProcessing(false);
    }
  };

  if (loading) return (
    <div className="flex min-h-screen bg-galatic-navy text-white">
      <Sidebar />
      <div className="ml-64 flex-1 flex items-center justify-center">Loading checkout...</div>
    </div>
  );

  if (!order) return null;

  const orderCost = parseFloat(order.totalAmount);
  const isBalanceSufficient = userBalance >= orderCost;

  return (
    <div className="flex min-h-screen bg-galatic-navy text-white">
      <Sidebar />

      <div className="ml-64 flex-1 p-8 flex justify-center items-start">
        <div className="w-full max-w-xl mt-8">
          
          <button 
            onClick={() => navigate(`/store/orders/${orderId}`)} 
            className="flex items-center gap-2 text-galatic-sky hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" /> Cancel and go back
          </button>

          <div className="bg-galatic-slate/20 border border-galatic-slate/50 rounded-2xl p-8">
            <h1 className="text-3xl font-bold text-galatic-cream mb-8 flex items-center gap-3">
              <ShoppingCart className="w-8 h-8" /> Checkout Order
            </h1>

            <div className="space-y-6">
              
              {/* Wallet Balance */}
              <div className="bg-galatic-navy/50 p-6 rounded-xl border border-galatic-slate/30 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-galatic-slate/30 rounded-lg">
                    <Wallet className="w-6 h-6 text-galatic-cream" />
                  </div>
                  <div>
                    <p className="text-galatic-sky/70 text-sm">Account Balance</p>
                    <p className="text-2xl font-bold text-white">৳{userBalance.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Order Cost */}
              <div className="bg-galatic-navy/50 p-6 rounded-xl border border-galatic-slate/30 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-500/20 rounded-lg">
                    <ShoppingCart className="w-6 h-6 text-red-400" />
                  </div>
                  <div>
                    <p className="text-galatic-sky/70 text-sm">Buy Cost</p>
                    <p className="text-2xl font-bold text-red-400">৳{orderCost.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Resulting Balance Preview */}
              <div className="bg-galatic-navy/50 p-6 rounded-xl border border-galatic-slate/30 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-500/20 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-galatic-sky/70 text-sm">New Balance After Purchase</p>
                    <p className={`text-2xl font-bold ${isBalanceSufficient ? 'text-green-400' : 'text-red-400'}`}>
                      ৳{isBalanceSufficient ? (userBalance - orderCost).toLocaleString() : 'Insufficient Funds'}
                    </p>
                  </div>
                </div>
              </div>

            </div>

            <button 
              onClick={handlePayment}
              disabled={processing || !isBalanceSufficient}
              className={`w-full mt-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                !isBalanceSufficient 
                  ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed' 
                  : 'bg-green-500 text-white hover:bg-green-400 shadow-[0_0_15px_rgba(74,222,128,0.3)]'
              }`}
            >
              {processing ? 'Processing...' : !isBalanceSufficient ? 'Insufficient Balance' : 'Buy Now'}
            </button>

            {!isBalanceSufficient && (
              <p className="text-center text-red-400 text-sm mt-4">
                You need ৳{(orderCost - userBalance).toLocaleString()} more to complete this purchase. 
                <button onClick={() => navigate('/store/topup')} className="text-galatic-cream hover:underline ml-1">Top Up Now</button>
              </p>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}