import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import AdminSidebar from '../components/AdminSidebar'; // IMPORT COMPONENT
import { PlusCircle, Edit, Trash2 } from 'lucide-react';

export default function Admin() {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [games, setGames] = useState([]);
  const [customersCount, setCustomersCount] = useState(0);
  const [loadingGames, setLoadingGames] = useState(true);
  const navigate = useNavigate();

  const ADMIN_EMAIL = 'notgalatic@gmail.com'; 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser || currentUser.email !== ADMIN_EMAIL) {
        navigate('/store'); 
      } else {
        setCheckingAuth(false);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const fetchData = async () => {
    setLoadingGames(true);
    try {
      const gamesSnapshot = await getDocs(collection(db, "games"));
      setGames(gamesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const usersSnapshot = await getDocs(collection(db, "users"));
      setCustomersCount(usersSnapshot.size);
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
    setLoadingGames(false);
  };

  useEffect(() => {
    if (!checkingAuth) fetchData();
  }, [checkingAuth]);

  const handleDelete = async (id) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <span className="font-bold text-white">Delete this game?</span>
        <div className="flex gap-2 justify-end">
          <button onClick={() => toast.dismiss(t.id)} className="bg-galatic-slate px-3 py-1 rounded text-white text-sm">Cancel</button>
          <button onClick={async () => {
            toast.dismiss(t.id);
            await deleteDoc(doc(db, "games", id));
            toast.success("Game deleted.");
            fetchData();
          }} className="bg-red-500 px-3 py-1 rounded text-white text-sm font-bold">Delete</button>
        </div>
      </div>
    ), { duration: 5000 });
  };

  const calculateRevenue = () => {
    let total = 0;
    games.forEach(game => {
      const priceStr = game.price?.replace(/[^0-9.]/g, '') || '0';
      const stockNum = Number(game.stock) || 0;
      total += (parseFloat(priceStr) * stockNum);
    });
    return total.toLocaleString();
  };

  if (checkingAuth) return <div className="min-h-screen bg-galatic-navy text-white flex items-center justify-center">Verifying Access...</div>;

  return (
    <div className="flex min-h-screen bg-galatic-navy text-white">
      
      <AdminSidebar /> {/* USE COMPONENT */}

      <div className="ml-64 flex-1 p-8">
        <h2 className="text-3xl font-bold mb-8">Dashboard Overview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-galatic-slate/20 p-6 rounded-2xl border border-galatic-slate/50">
            <p className="text-galatic-sky/70 text-sm mb-1">Total Games</p>
            <h3 className="text-3xl font-bold text-white">{games.length}</h3>
          </div>
          <div className="bg-galatic-slate/20 p-6 rounded-2xl border border-galatic-slate/50">
             <p className="text-galatic-sky/70 text-sm mb-1">Total Customers</p>
             <h3 className="text-3xl font-bold text-white">{customersCount}</h3>
          </div>
          <div className="bg-galatic-slate/20 p-6 rounded-2xl border border-galatic-slate/50">
             <p className="text-galatic-sky/70 text-sm mb-1">Inventory Value</p>
             <h3 className="text-3xl font-bold text-green-400">৳{calculateRevenue()}</h3>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold">Manage Products</h3>
          <Link to="/admin/add-game" className="bg-galatic-cream text-galatic-navy px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-white transition-all"><PlusCircle className="w-4 h-4" /> Add New</Link>
        </div>

        <div className="bg-galatic-slate/20 rounded-2xl border border-galatic-slate/50 overflow-hidden">
          {loadingGames ? (
            <div className="p-8 text-center text-galatic-sky">Loading games...</div>
          ) : games.length === 0 ? (
            <div className="p-8 text-center text-galatic-sky">No games added yet.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-galatic-slate/40 border-b border-galatic-slate/50 text-galatic-sky text-sm">
                  <th className="p-4 font-medium">Game</th>
                  <th className="p-4 font-medium">Category</th>
                  <th className="p-4 font-medium">Price</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {games.map((game) => (
                  <tr key={game.id} className="border-b border-galatic-slate/20 hover:bg-galatic-slate/10 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <img src={game.image} alt={game.title} className="w-12 h-12 rounded object-cover border border-galatic-slate/50" />
                      <span className="font-bold text-white">{game.title}</span>
                    </td>
                    <td className="p-4 text-galatic-sky/70">{game.category}</td>
                    <td className="p-4 text-galatic-cream font-bold">{game.price}</td>
                    <td className="p-4 flex justify-end gap-2">
                      <Link to={`/admin/edit-game/${game.id}`} className="p-2 bg-galatic-slate/30 rounded hover:bg-galatic-sky/20 text-galatic-sky transition-colors" title="Edit">
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button onClick={() => handleDelete(game.id)} className="p-2 bg-red-500/10 rounded hover:bg-red-500/30 text-red-400 transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}