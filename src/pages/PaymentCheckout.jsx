import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import { ArrowLeft, CreditCard, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function PaymentCheckout() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('bkash');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const docRef = doc(db, "orders", orderId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.userId !== auth.currentUser.uid) {
            toast.error("Unauthorized access.");
            navigate('/store/orders');
            return;
          }
          if (data.status === 'Paid') {
            toast.success("This order is already paid.");
            navigate(`/store/orders/${orderId}`);
            return;
          }
          setOrder({ id: docSnap.id, ...data });
        } else {
          toast.error("Order not found!");
          navigate('/store/orders');
        }
      } catch (error) {
        console.error("Error fetching order: ", error);
      }
      setLoading(false);
    };
    
    if (auth.currentUser) fetchOrder();
  }, [orderId, navigate]);

  const handlePayment = async (e) => {
    e.preventDefault();
    setProcessing(true);
    const loadingToast = toast.loading(`Connecting to ${selectedMethod.toUpperCase()} gateway...`);

    // Simulate payment gateway delay
    setTimeout(async () => {
      try {
        // 1. Update Order Status to Paid
        const orderRef = doc(db, "orders", orderId);
        await updateDoc(orderRef, { status: 'Paid' });
        
        // 2. Success
        toast.success("Payment successful! Order confirmed.", { id: loadingToast });
        navigate(`/store/orders/${orderId}`);
      } catch (error) {
        console.error("Error processing payment: ", error);
        toast.error("Payment failed. Please try again.", { id: loadingToast });
        setProcessing(false);
      }
    }, 2000);
  };

  if (loading) return (
    <div className="flex min-h-screen bg-galatic-navy text-white">
      <Sidebar />
      <div className="ml-64 flex-1 flex items-center justify-center">Loading payment portal...</div>
    </div>
  );

  if (!order) return null;

  return (
    <div className="flex min-h-screen bg-galatic-navy text-white">
      <Sidebar />

      <div className="ml-64 flex-1 p-8 flex justify-center items-start">
        <div className="w-full max-w-2xl mt-8">
          
          <button 
            onClick={() => navigate(`/store/orders/${orderId}`)} 
            className="flex items-center gap-2 text-galatic-sky hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" /> Cancel and go back
          </button>

          <div className="bg-galatic-slate/20 border border-galatic-slate/50 rounded-2xl overflow-hidden">
            
            {/* Header */}
            <div className="bg-galatic-slate/40 p-6 border-b border-galatic-slate/50 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-galatic-cream flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6" /> Secure Checkout
                </h1>
                <p className="text-sm text-galatic-sky/70 mt-1">Order #{order.id.slice(-6).toUpperCase()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-galatic-sky/70">Total to pay</p>
                <p className="text-3xl font-bold text-green-400">৳{order.totalAmount}</p>
              </div>
            </div>

            {/* Payment Methods */}
            <form onSubmit={handlePayment} className="p-6 space-y-6">
              <div>
                <h2 className="text-lg font-bold mb-4">Select Payment Method</h2>
                <div className="grid grid-cols-2 gap-4">
                  {/* bKash */}
                  <label className={`cursor-pointer border rounded-xl p-4 flex items-center gap-3 transition-all ${selectedMethod === 'bkash' ? 'border-pink-500 bg-pink-500/10' : 'border-galatic-slate hover:border-galatic-sky'}`}>
                    <input type="radio" name="method" value="bkash" checked={selectedMethod === 'bkash'} onChange={() => setSelectedMethod('bkash')} className="hidden" />
                    <div className="w-10 h-10 rounded-lg bg-[#E2136E] flex items-center justify-center font-bold text-white text-xl">b</div>
                    <div>
                      <p className="font-bold text-white">bKash</p>
                      <p className="text-xs text-galatic-sky/70">Mobile Banking</p>
                    </div>
                  </label>

                  {/* Nagad */}
                  <label className={`cursor-pointer border rounded-xl p-4 flex items-center gap-3 transition-all ${selectedMethod === 'nagad' ? 'border-orange-500 bg-orange-500/10' : 'border-galatic-slate hover:border-galatic-sky'}`}>
                    <input type="radio" name="method" value="nagad" checked={selectedMethod === 'nagad'} onChange={() => setSelectedMethod('nagad')} className="hidden" />
                    <div className="w-10 h-10 rounded-lg bg-[#F7941D] flex items-center justify-center font-bold text-white text-xl">N</div>
                    <div>
                      <p className="font-bold text-white">Nagad</p>
                      <p className="text-xs text-galatic-sky/70">Mobile Banking</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Fake Inputs (Simulation) */}
              <div className="space-y-4 pt-4 border-t border-galatic-slate/50">
                <div>
                  <label className="block text-sm mb-1 text-galatic-sky">Account Number</label>
                  <input required type="text" placeholder="e.g. 017XXXXXXXX" className="w-full bg-galatic-navy border border-galatic-slate rounded-lg p-3 text-white focus:outline-none focus:border-galatic-sky" />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-galatic-sky">PIN</label>
                  <input required type="password" placeholder="••••" maxLength={4} className="w-full bg-galatic-navy border border-galatic-slate rounded-lg p-3 text-white focus:outline-none focus:border-galatic-sky" />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={processing}
                className="w-full bg-green-500 text-white font-bold py-4 rounded-xl hover:bg-green-400 transition-all shadow-[0_0_15px_rgba(74,222,128,0.3)] flex justify-center items-center gap-2 text-lg mt-6"
              >
                <CreditCard className="w-6 h-6" /> {processing ? 'Processing Payment...' : `Pay ৳${order.totalAmount}`}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}