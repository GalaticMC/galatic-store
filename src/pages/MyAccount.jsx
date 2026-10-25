import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { User, Mail, Shield, Calendar, LogOut, Loader, Wallet, PlusCircle, History, CheckCircle, XCircle, Clock } from 'lucide-react';
import { db, auth } from '../firebase';
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import toast from 'react-hot-toast';

export default function MyAccount() {
  const [userData, setUserData] = useState(null);
  const [topups, setTopups] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let unsubscribeTopups = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/login');
        return;
      }

      // 1. Fetch User Profile Data
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setUserData({
            uid: user.uid,
            authEmail: user.email,
            ...docSnap.data()
          });
        } else {
          setUserData({
            uid: user.uid,
            name: user.displayName || 'Valued Customer',
            email: user.email,
            role: 'Customer',
            joinedDate: 'N/A',
            totalSpent: '0'
          });
        }
      } catch (error) {
        console.error("Error fetching profile: ", error);
        toast.error("Failed to load profile data.");
      }

      // 2. Fetch Top-Up History (Real-time)
      const topupsRef = collection(db, "topup_requests");
      const q = query(topupsRef, where("userId", "==", user.uid));
      
      unsubscribeTopups = onSnapshot(q, (snapshot) => {
        const history = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort newest first
        history.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
        setTopups(history);
        setLoading(false);
      });
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeTopups) unsubscribeTopups();
    };
  }, [navigate]);

  const handleLogout = () => {
    signOut(auth).then(() => {
      toast.success("Logged out successfully");
      navigate('/login');
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return <span className="flex items-center gap-1 text-green-400 text-xs font-bold bg-green-400/10 px-2 py-1 rounded"><CheckCircle className="w-3 h-3"/> Approved</span>;
      case 'Rejected':
        return <span className="flex items-center gap-1 text-red-400 text-xs font-bold bg-red-400/10 px-2 py-1 rounded"><XCircle className="w-3 h-3"/> Rejected</span>;
      default:
        return <span className="flex items-center gap-1 text-yellow-400 text-xs font-bold bg-yellow-400/10 px-2 py-1 rounded"><Clock className="w-3 h-3"/> {status}</span>;
    }
  };

  if (loading) return (
    <div className="flex min-h-screen bg-galatic-navy text-white">
      <Sidebar />
      <div className="ml-64 flex-1 flex items-center justify-center">
        <div className="flex items-center gap-3 text-galatic-cream text-xl">
          <Loader className="w-6 h-6 animate-spin" /> Loading profile...
        </div>
      </div>
    </div>
  );

  if (!userData) return null;

  const cleanBalance = userData.totalSpent ? userData.totalSpent.replace(/[^0-9.]/g, '') : '0';

  return (
    <div className="flex min-h-screen bg-galatic-navy text-galatic-sky">
      <Sidebar />
      
      <main className="ml-64 flex-1 p-8">
        <h1 className="text-3xl font-bold text-galatic-cream mb-8 flex items-center gap-3">
          <User className="w-8 h-8" /> My Account
        </h1>

        <div className="flex flex-col gap-6 max-w-4xl">
          
          {/* WALLET CARD */}
          <div className="bg-galatic-slate/20 border border-galatic-slate/50 rounded-2xl p-6 flex justify-between items-center">
            <div>
              <p className="text-galatic-sky/70 text-sm mb-1 flex items-center gap-2">
                <Wallet className="w-4 h-4" /> My Balance
              </p>
              <h2 className="text-3xl font-bold text-green-400">৳{cleanBalance}</h2>
            </div>
            <button 
              onClick={() => navigate('/store/topup')}
              className="bg-galatic-cream text-galatic-navy px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-white transition-all shadow-[0_0_15px_rgba(255,235,194,0.3)]"
            >
              <PlusCircle className="w-5 h-5" /> Top Up
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* PROFILE CARD */}
            <div className="bg-galatic-slate/20 border border-galatic-slate/50 rounded-2xl p-8">
              <div className="flex items-center gap-6 mb-8 border-b border-galatic-slate/30 pb-8">
                <div className="w-20 h-20 bg-galatic-cream rounded-full flex items-center justify-center text-galatic-navy text-3xl font-bold">
                  {userData.name ? userData.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{userData.name || 'Valued Customer'}</h2>
                  <span className="inline-block mt-2 px-3 py-1 bg-galatic-slate/50 text-galatic-sky rounded text-xs font-bold uppercase tracking-wider">
                    {userData.role || 'Customer'}
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-galatic-navy/50 rounded-xl border border-galatic-slate/30">
                    <Mail className="w-5 h-5 text-galatic-sky" />
                  </div>
                  <div>
                    <p className="text-sm text-galatic-sky/70">Email Address</p>
                    <p className="font-bold text-white text-sm truncate">{userData.authEmail || userData.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="p-3 bg-galatic-navy/50 rounded-xl border border-galatic-slate/30">
                    <Shield className="w-5 h-5 text-galatic-sky" />
                  </div>
                  <div>
                    <p className="text-sm text-galatic-sky/70">Account ID</p>
                    <p className="font-bold text-white font-mono text-xs truncate">{userData.uid}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="p-3 bg-galatic-navy/50 rounded-xl border border-galatic-slate/30">
                    <Calendar className="w-5 h-5 text-galatic-sky" />
                  </div>
                  <div>
                    <p className="text-sm text-galatic-sky/70">Member Since</p>
                    <p className="font-bold text-white">{userData.joinedDate || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-galatic-slate/30">
                <button 
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-red-500/10 text-red-400 font-bold rounded-xl hover:bg-red-500/20 transition-colors border border-red-500/20"
                >
                  <LogOut className="w-5 h-5" /> Sign Out
                </button>
              </div>
            </div>

            {/* TOP-UP HISTORY CARD */}
            <div className="bg-galatic-slate/20 border border-galatic-slate/50 rounded-2xl p-8 h-fit">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 border-b border-galatic-slate/30 pb-4">
                <History className="w-5 h-5 text-galatic-cream" /> Top-Up History
              </h2>

              {topups.length === 0 ? (
                <div className="text-center py-8 text-galatic-sky/70">
                  <p>No top-up history found.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                  {topups.map((topup) => {
                    const date = topup.createdAt?.toDate 
                      ? topup.createdAt.toDate().toLocaleDateString() 
                      : 'N/A';
                      
                    return (
                      <div key={topup.id} className="bg-galatic-navy/50 border border-galatic-slate/30 p-4 rounded-xl flex justify-between items-center">
                        <div>
                          <p className="font-bold text-white text-lg">৳{topup.amount}</p>
                          <p className="text-xs text-galatic-sky/70 mt-1">{topup.method.toUpperCase()} • {date}</p>
                        </div>
                        <div>
                          {getStatusBadge(topup.status)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}