import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import { ArrowLeft, CheckCircle2, Copy } from 'lucide-react';

import bkashLogo from '../assets/bkash.png';
import nagadLogo from '../assets/nagad.png';

export default function TopUpPayment() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trxId, setTrxId] = useState('');
  const [senderNumber, setSenderNumber] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchRequest = async () => {
      const docRef = doc(db, "topup_requests", requestId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setRequest(docSnap.data());
      } else {
        toast.error("Invalid request.");
        navigate('/account'); // FIXED
      }
      setLoading(false);
    };
    fetchRequest();
  }, [requestId, navigate]);

  const copyNumber = () => {
    navigator.clipboard.writeText('01601808761');
    toast.success("Number copied!");
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!trxId.trim() || !senderNumber.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }
    
    setProcessing(true);
    try {
      const reqRef = doc(db, "topup_requests", requestId);
      await updateDoc(reqRef, {
        trxId: trxId.trim(),
        senderNumber: senderNumber.trim(),
        status: 'Verifying'
      });
      
      toast.success("Verification submitted! Please wait for admin approval.");
      navigate('/account'); // FIXED
    } catch (error) {
      toast.error("Failed to submit verification.");
      setProcessing(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-galatic-navy text-white flex items-center justify-center">Loading...</div>;
  if (!request) return null;

  const isBkash = request.method === 'bkash';
  const methodLogo = isBkash ? bkashLogo : nagadLogo;
  const methodName = isBkash ? 'bKash' : 'Nagad';
  const methodColor = isBkash ? 'text-pink-500' : 'text-orange-500';

  return (
    <div className="flex min-h-screen bg-galatic-navy text-white">
      <Sidebar />
      <div className="ml-64 flex-1 p-8 flex justify-center items-start">
        <div className="w-full max-w-xl mt-8">
          <button onClick={() => navigate('/account')} className="flex items-center gap-2 text-galatic-sky hover:text-white mb-6 transition-colors"> {/* FIXED */}
            <ArrowLeft className="w-5 h-5" /> Cancel and go back
          </button>

          <div className="bg-galatic-slate/20 border border-galatic-slate/50 rounded-2xl overflow-hidden">
            <div className="bg-galatic-slate/40 p-6 border-b border-galatic-slate/50">
              <h1 className="text-2xl font-bold text-galatic-cream">Complete Your Payment</h1>
              <p className="text-sm text-galatic-sky/70 mt-1">Please send exactly <span className="text-green-400 font-bold">৳{request.amount}</span> to the number below.</p>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-galatic-navy/50 border border-galatic-slate/30 rounded-xl p-6 text-center">
                <div className="flex flex-col items-center justify-center mb-4">
                  <img src={methodLogo} alt={methodName} className="h-16 w-16 object-contain mb-3 rounded-xl" />
                  <p className="text-sm text-galatic-sky">Send Money via <span className={`font-bold ${methodColor}`}>{methodName}</span></p>
                </div>
                
                <div className="flex items-center justify-center gap-4 mb-4">
                  <h2 className="text-4xl font-bold text-white tracking-widest">01601808761</h2>
                  <button onClick={copyNumber} className="p-2 bg-galatic-slate/50 rounded-lg hover:bg-galatic-slate transition-colors" title="Copy Number">
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-sm text-red-400 font-bold">Amount: ৳{request.amount}</p>
              </div>

              <form onSubmit={handleVerify} className="space-y-4 pt-4 border-t border-galatic-slate/30">
                <h3 className="text-lg font-bold text-white">Submit Verification</h3>
                
                <div>
                  <label className="block text-sm mb-1 text-galatic-sky">Your Sender Number</label>
                  <input required type="text" value={senderNumber} onChange={(e) => setSenderNumber(e.target.value)} placeholder="e.g. 017XXXXXXXX" className="w-full bg-galatic-navy border border-galatic-slate rounded-lg p-3 text-white focus:outline-none focus:border-galatic-sky" />
                </div>

                <div>
                  <label className="block text-sm mb-1 text-galatic-sky">Transaction ID (TrxID)</label>
                  <input required type="text" value={trxId} onChange={(e) => setTrxId(e.target.value)} placeholder="e.g. 9A7B6C5D4E" className="w-full bg-galatic-navy border border-galatic-slate rounded-lg p-3 text-white focus:outline-none focus:border-galatic-sky" />
                </div>

                <button type="submit" disabled={processing} className="w-full bg-galatic-cream text-galatic-navy font-bold py-4 rounded-xl hover:bg-white transition-all flex justify-center items-center gap-2 mt-4">
                  <CheckCircle2 className="w-5 h-5" /> {processing ? 'Submitting...' : 'Verify Payment'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}