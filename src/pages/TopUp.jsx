import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import { ArrowLeft, CreditCard, ShieldCheck } from 'lucide-react';

// IMPORT THE LOGOS FROM YOUR ASSETS FOLDER
import bkashLogo from '../assets/bkash.png';
import nagadLogo from '../assets/nagad.png';

export default function TopUp() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('500');
  const [processing, setProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('bkash');

  const handleTopUp = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }

    setProcessing(true);
    try {
      const docRef = await addDoc(collection(db, "topup_requests"), {
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,
        amount: Number(amount),
        method: selectedMethod,
        status: 'Pending',
        createdAt: new Date()
      });

      toast.success("Request created! Please complete the payment.");
      navigate(`/store/topup/${docRef.id}`);
    } catch (error) {
      console.error("Top up error: ", error);
      toast.error("Failed to initiate top up.");
      setProcessing(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-galatic-navy text-white">
      <Sidebar />

      <div className="ml-64 flex-1 p-8 flex justify-center items-start">
        <div className="w-full max-w-2xl mt-8">
          <button 
            onClick={() => navigate('/store/account')} 
            className="flex items-center gap-2 text-galatic-sky hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" /> Cancel and go back
          </button>

          <div className="bg-galatic-slate/20 border border-galatic-slate/50 rounded-2xl overflow-hidden">
            <div className="bg-galatic-slate/40 p-6 border-b border-galatic-slate/50">
              <h1 className="text-2xl font-bold text-galatic-cream flex items-center gap-2">
                <ShieldCheck className="w-6 h-6" /> Wallet Top Up
              </h1>
              <p className="text-sm text-galatic-sky/70 mt-1">Add funds to your Galatic Store account.</p>
            </div>

            <form onSubmit={handleTopUp} className="p-6 space-y-6">
              <div>
                <label className="block text-sm mb-2 text-galatic-sky">Enter Amount (৳)</label>
                <input 
                  required 
                  type="number" 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)} 
                  className="w-full bg-galatic-navy border border-galatic-slate rounded-lg p-4 text-2xl font-bold text-white focus:outline-none focus:border-galatic-sky" 
                  placeholder="e.g. 500" 
                />
                <div className="flex gap-2 mt-2">
                  {['100', '500', '1000', '2000'].map(val => (
                    <button key={val} type="button" onClick={() => setAmount(val)} className="flex-1 bg-galatic-slate/30 hover:bg-galatic-slate py-1 rounded text-sm transition-colors">
                      ৳{val}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-lg font-bold mb-4">Select Payment Method</h2>
                <div className="grid grid-cols-2 gap-4">
                  
                  {/* bKash Option */}
                  <label className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center justify-center transition-all ${selectedMethod === 'bkash' ? 'border-pink-500 bg-pink-500/10 shadow-[0_0_15px_rgba(226,19,110,0.3)]' : 'border-galatic-slate hover:border-galatic-sky bg-galatic-navy'}`}>
                    <input type="radio" name="method" value="bkash" checked={selectedMethod === 'bkash'} onChange={() => setSelectedMethod('bkash')} className="hidden" />
                    <img src={bkashLogo} alt="bKash" className="h-12 w-12 object-contain mb-2 rounded-lg" />
                    <span className="font-bold text-white">bKash</span>
                  </label>

                  {/* Nagad Option */}
                  <label className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center justify-center transition-all ${selectedMethod === 'nagad' ? 'border-orange-500 bg-orange-500/10 shadow-[0_0_15px_rgba(247,148,29,0.3)]' : 'border-galatic-slate hover:border-galatic-sky bg-galatic-navy'}`}>
                    <input type="radio" name="method" value="nagad" checked={selectedMethod === 'nagad'} onChange={() => setSelectedMethod('nagad')} className="hidden" />
                    <img src={nagadLogo} alt="Nagad" className="h-12 w-12 object-contain mb-2 rounded-lg" />
                    <span className="font-bold text-white">Nagad</span>
                  </label>

                </div>
              </div>

              <button 
                type="submit" 
                disabled={processing}
                className="w-full bg-green-500 text-white font-bold py-4 rounded-xl hover:bg-green-400 transition-all shadow-[0_0_15px_rgba(74,222,128,0.3)] flex justify-center items-center gap-2 text-lg mt-6"
              >
                <CreditCard className="w-6 h-6" /> {processing ? 'Processing...' : `Top Up ৳${amount}`}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}