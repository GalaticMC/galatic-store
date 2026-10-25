import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Trash2, ShoppingBag, Loader } from 'lucide-react';
import { db, auth } from '../firebase';
import { collection, doc, updateDoc, addDoc, deleteDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import toast from 'react-hot-toast';

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let unsubscribeCart = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate('/login');
        return;
      }
      setUser(currentUser);
      
      const cartRef = collection(db, `carts/${currentUser.uid}/items`);
      unsubscribeCart = onSnapshot(cartRef, (snapshot) => {
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCartItems(items);
        setLoading(false);
      });
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeCart) unsubscribeCart();
    };
  }, [navigate]);

  const handleRemove = async (cartItemId) => {
    try {
      await deleteDoc(doc(db, `carts/${user.uid}/items`, cartItemId));
      toast.success("Removed from cart");
      
      if (cartItems.length === 1) {
        navigate('/');
      }
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    
    const loadingToast = toast.loading("Processing order...");
    
    try {
      const totalAmount = cartItems.reduce((acc, item) => acc + parseFloat(item.price.replace(/[^0-9.]/g, '')), 0).toFixed(2);
      
      // 1. Create the Order in Firestore
      const orderRef = await addDoc(collection(db, "orders"), {
        userId: user.uid,
        userEmail: user.email,
        items: cartItems,
        totalAmount: totalAmount,
        status: 'Unpaid', // Status is Unpaid until the user pays
        createdAt: new Date()
      });

      // 2. Reduce Stock
      for (const item of cartItems) {
        const gameRef = doc(db, "games", item.gameId);
        const gameSnap = await getDoc(gameRef);
        
        if (gameSnap.exists()) {
          const currentStock = gameSnap.data().stock || 0;
          if (currentStock > 0) {
            await updateDoc(gameRef, { stock: currentStock - 1 });
          }
        }
      }

      // 3. Clear the Cart
      for (const item of cartItems) {
        await deleteDoc(doc(db, `carts/${user.uid}/items`, item.id));
      }

      toast.success("Order placed successfully! Please proceed to payment.", { id: loadingToast });
      navigate('/orders'); 
    } catch (error) {
      console.error("Checkout error: ", error);
      toast.error("Checkout failed. Please try again.", { id: loadingToast });
    }
  };

  const total = cartItems.reduce((acc, item) => acc + parseFloat(item.price.replace(/[^0-9.]/g, '')), 0);

  if (loading) return (
    <div className="flex min-h-screen bg-galatic-navy text-white">
      <Sidebar />
      <div className="ml-64 flex-1 flex items-center justify-center">
        <div className="flex items-center gap-3 text-galatic-cream text-xl">
          <Loader className="w-6 h-6 animate-spin" /> Loading Cart...
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-galatic-navy text-galatic-sky">
      <Sidebar />
      
      <main className="ml-64 flex-1 p-8">
        <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
          <ShoppingBag className="w-8 h-8 text-galatic-cream" /> Your Cart
        </h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-20 bg-galatic-slate/10 rounded-2xl border border-galatic-slate/20">
            <p className="text-galatic-sky text-xl mb-4">Your cart is empty.</p>
            <Link to="/" className="text-galatic-cream hover:underline">Browse Games &rarr;</Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-galatic-slate/10 border border-galatic-slate/30 rounded-2xl p-4 flex gap-4 items-center">
                  <img src={item.image} alt={item.title} className="w-24 h-24 object-cover rounded-xl" />
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg">{item.title}</h3>
                    <p className="text-galatic-sky/70 text-sm">{item.category}</p>
                    <p className="text-galatic-cream font-bold mt-2">৳{item.price}</p>
                  </div>
                  <button onClick={() => handleRemove(item.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="w-full lg:w-96 bg-galatic-slate/20 border border-galatic-slate/50 rounded-2xl p-6 h-fit">
              <h2 className="text-xl font-bold text-white mb-4 border-b border-galatic-slate/50 pb-4">Order Summary</h2>
              <div className="space-y-3 mb-6">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-galatic-sky/70 truncate pr-4">{item.title}</span>
                    <span className="text-white font-bold">৳{item.price}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center border-t border-galatic-slate/50 pt-4 mb-6">
                <span className="text-lg font-bold text-white">Total</span>
                <span className="text-2xl font-bold text-green-400">৳{total.toFixed(2)}</span>
              </div>
              <button 
                onClick={handleCheckout}
                className="w-full bg-galatic-cream text-galatic-navy font-bold py-4 rounded-xl hover:bg-white transition-all shadow-[0_0_15px_rgba(255,235,194,0.3)]"
              >
                Checkout Now
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}