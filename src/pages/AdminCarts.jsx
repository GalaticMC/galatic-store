import { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import AdminSidebar from '../components/AdminSidebar';
import { ShoppingCart, User, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminCarts() {
  const [activeCarts, setActiveCarts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We need a listener for users, and then listeners for their carts. 
    // For simplicity, we will just re-fetch everything when any change happens.
    // In a huge app, we would nest onSnapshots.
    
    const unsubscribeUsers = onSnapshot(collection(db, "users"), async (usersSnapshot) => {
      const cartsData = [];

      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();
        // We use getDocs here inside the listener, but since the user snapshot fired, it's up to date
        const cartItemsSnapshot = await getDocs(collection(db, `carts/${userDoc.id}/items`));
        
        if (!cartItemsSnapshot.empty) {
          const items = cartItemsSnapshot.docs.map(item => ({ id: item.id, ...item.data() }));
          const total = items.reduce((acc, item) => acc + parseFloat(item.price.replace(/[^0-9.]/g, '')), 0);
          
          cartsData.push({
            userId: userDoc.id,
            userName: userData.name || 'Unknown',
            userEmail: userData.email,
            items: items,
            total: total
          });
        }
      }
      setActiveCarts(cartsData);
      setLoading(false);
    });

    return () => unsubscribeUsers();
  }, []);

  const handleDeleteItem = async (userId, itemId, itemTitle) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <span className="font-bold text-white">Remove {itemTitle} from cart?</span>
        <div className="flex gap-2 justify-end">
          <button onClick={() => toast.dismiss(t.id)} className="bg-galatic-slate px-3 py-1 rounded text-white text-sm">Cancel</button>
          <button onClick={async () => {
            toast.dismiss(t.id);
            try {
              await deleteDoc(doc(db, `carts/${userId}/items`, itemId));
              toast.success("Item removed from cart.");
            } catch (error) {
              toast.error("Failed to remove item.");
            }
          }} className="bg-red-500 px-3 py-1 rounded text-white text-sm font-bold">Remove</button>
        </div>
      </div>
    ), { duration: 5000 });
  };

  return (
    <div className="flex min-h-screen bg-galatic-navy text-white">
      <AdminSidebar />
      <div className="ml-64 flex-1 p-8">
        <div className="flex items-center gap-3 mb-8">
          <ShoppingCart className="w-8 h-8 text-galatic-cream" />
          <h1 className="text-3xl font-bold text-galatic-cream">Active Customer Carts</h1>
        </div>

        <div className="space-y-12">
          {loading ? (
            <div className="text-center text-galatic-sky py-10">Loading active carts...</div>
          ) : activeCarts.length === 0 ? (
            <div className="text-center bg-galatic-slate/10 p-12 rounded-2xl border border-galatic-slate/30 text-galatic-sky">
              No active carts found. Customers haven't added anything yet.
            </div>
          ) : (
            activeCarts.map((cart) => (
              <div key={cart.userId} className="bg-[#021a2b] border border-galatic-slate/30 rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-6 border-b border-galatic-slate/30 pb-4">
                  <div className="p-2 bg-galatic-slate/40 rounded-full"><User className="w-5 h-5" /></div>
                  <div>
                    <p className="font-bold text-white text-lg">{cart.userName}</p>
                    <p className="text-xs text-galatic-sky/70">{cart.userEmail}</p>
                  </div>
                </div>
                
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="flex-1 space-y-4">
                    {cart.items.map((item) => (
                      <div key={item.id} className="bg-galatic-slate/10 border border-galatic-slate/30 rounded-2xl p-4 flex gap-4 items-center">
                        <img src={item.image} alt={item.title} className="w-24 h-24 object-cover rounded-xl" />
                        <div className="flex-1">
                          <h3 className="text-white font-bold text-lg">{item.title}</h3>
                          <p className="text-galatic-sky/70 text-sm">{item.category}</p>
                          <p className="text-galatic-cream font-bold mt-2">{item.price}</p>
                        </div>
                        <button onClick={() => handleDeleteItem(cart.userId, item.id, item.title)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="w-full lg:w-96 bg-galatic-slate/20 border border-galatic-slate/50 rounded-2xl p-6 h-fit">
                    <h2 className="text-xl font-bold text-white mb-4 border-b border-galatic-slate/50 pb-4">Cart Summary</h2>
                    <div className="space-y-3 mb-6">
                      {cart.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-galatic-sky/70 truncate pr-4">{item.title}</span>
                          <span className="text-white font-bold">{item.price}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center border-t border-galatic-slate/50 pt-4">
                      <span className="text-lg font-bold text-white">Total</span>
                      <span className="text-2xl font-bold text-green-400">৳{cart.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}