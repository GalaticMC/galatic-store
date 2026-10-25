import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import AdminSidebar from '../components/AdminSidebar';
import toast from 'react-hot-toast';
import { Wallet, CheckCircle, XCircle, Search, Loader } from 'lucide-react';

export default function AdminTopUps() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [adminTrxInputs, setAdminTrxInputs] = useState({});

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "topup_requests"), (snapshot) => {
      const reqs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      reqs.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setRequests(reqs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleInputChange = (reqId, value) => {
    setAdminTrxInputs(prev => ({
      ...prev,
      [reqId]: value
    }));
  };

  const handleVerifyAndApprove = async (req) => {
    if (processingId === req.id) return;
    
    const adminTypedTrx = adminTrxInputs[req.id];

    if (!adminTypedTrx) {
      toast.error("Please enter the TrxID from your payment app to verify.");
      return;
    }

    if (adminTypedTrx.trim() !== req.trxId.trim()) {
      toast.error("TrxID Mismatch! The ID you entered does not match the user's submission.");
      return;
    }

    setProcessingId(req.id);

    try {
      const reqRef = doc(db, "topup_requests", req.id);
      const latestReqSnap = await getDoc(reqRef);
      
      if (!latestReqSnap.exists() || latestReqSnap.data().status === 'Approved') {
        toast.error("This request has already been approved!");
        setProcessingId(null);
        return; 
      }

      const userRef = doc(db, "users", req.userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const currentBalanceStr = userSnap.data().totalSpent || '৳0';
        const currentBalance = parseFloat(currentBalanceStr.replace(/[^0-9.]/g, '')) || 0;
        const newBalance = currentBalance + req.amount;
        
        await updateDoc(userRef, {
          totalSpent: `৳${newBalance.toLocaleString()}`
        });
      }

      await updateDoc(reqRef, { status: 'Approved' });
      
      toast.success(`Verified! Approved ৳${req.amount} for ${req.userEmail}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to approve request.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    if(window.confirm("Are you sure you want to reject this top-up request?")) {
      try {
        const reqRef = doc(db, "topup_requests", id);
        await updateDoc(reqRef, { status: 'Rejected' });
        toast.success("Request rejected.");
      } catch (error) {
        toast.error("Failed to reject request.");
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-galatic-navy text-white">
      <AdminSidebar />
      
      <div className="ml-64 flex-1 p-8">
        <div className="flex items-center gap-3 mb-8">
          <Wallet className="w-8 h-8 text-galatic-cream" />
          <h1 className="text-3xl font-bold text-galatic-cream">Top-Up Requests</h1>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center text-galatic-sky py-10">Loading requests...</div>
          ) : requests.length === 0 ? (
            <div className="text-center bg-galatic-slate/10 p-12 rounded-2xl border border-galatic-slate/30 text-galatic-sky">No top-up requests yet.</div>
          ) : (
            requests.map(req => (
              <div key={req.id} className="bg-galatic-slate/20 border border-galatic-slate/50 rounded-2xl p-6">
                <div className="flex justify-between items-start mb-4 border-b border-galatic-slate/30 pb-4">
                  <div>
                    <p className="text-sm text-galatic-sky/70">User: <span className="text-white font-bold">{req.userEmail}</span></p>
                    <p className="text-xs text-galatic-sky/50 mt-1">Method: <span className="text-white uppercase">{req.method}</span> | Sender: <span className="text-white">{req.senderNumber}</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-400">৳{req.amount}</p>
                    <span className={`inline-block mt-1 px-3 py-1 rounded text-xs font-bold ${
                      req.status === 'Approved' ? 'bg-green-400/20 text-green-400' : 
                      req.status === 'Rejected' ? 'bg-red-400/20 text-red-400' : 
                      'bg-yellow-400/20 text-yellow-400'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                  <div>
                    <p className="text-sm text-galatic-sky/70 mb-1">User Submitted TrxID:</p>
                    <p className="font-mono text-lg text-white font-bold bg-galatic-navy/50 p-2 rounded border border-galatic-slate/30">{req.trxId || 'Not provided yet'}</p>
                  </div>

                  {req.status === 'Verifying' && (
                    <div>
                      <p className="text-sm text-galatic-cream mb-1">Verify TrxID (Check your App):</p>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-galatic-sky/50" />
                        <input 
                          type="text" 
                          placeholder="Type TrxID here to match..." 
                          value={adminTrxInputs[req.id] || ''}
                          onChange={(e) => handleInputChange(req.id, e.target.value)}
                          className="w-full bg-galatic-navy border border-galatic-slate rounded-lg py-2 pl-10 pr-3 text-white focus:outline-none focus:border-galatic-sky"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {req.status === 'Verifying' && (
                  <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-galatic-slate/30">
                    <button onClick={() => handleReject(req.id)} className="flex items-center gap-2 px-6 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors font-bold border border-red-500/20">
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                    <button 
                      onClick={() => handleVerifyAndApprove(req)} 
                      disabled={processingId === req.id}
                      className="flex items-center gap-2 px-6 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors font-bold border border-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processingId === req.id ? (
                        <><Loader className="w-4 h-4 animate-spin" /> Verifying...</>
                      ) : (
                        <><CheckCircle className="w-4 h-4" /> Verify & Approve</>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}