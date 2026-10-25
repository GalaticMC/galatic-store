import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Store, Gamepad2, LogOut, ShoppingCart, Package, User } from 'lucide-react';
import { auth, db } from '../firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot } from 'firebase/firestore';
import logo from '../assets/logo.png'; 

export default function Sidebar() {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    let unsubscribeCart = null;
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const cartRef = collection(db, `carts/${user.uid}/items`);
        unsubscribeCart = onSnapshot(cartRef, (snapshot) => {
          setCartCount(snapshot.size);
        });
      } else {
        setCartCount(0);
      }
    });
    return () => {
      unsubscribeAuth();
      if (unsubscribeCart) unsubscribeCart();
    };
  }, []);

  const handleLogout = () => {
    signOut(auth).then(() => {
      window.location.href = '/login';
    });
  };

  const navItems = [
    { name: 'Home', icon: Home, path: '/', exact: true },
    { name: 'Store', icon: Store, path: '/games', exact: true },
    { name: 'Categories', icon: Gamepad2, path: '/categories', exact: true }, 
    { name: 'Cart', icon: ShoppingCart, path: '/cart', badge: cartCount, exact: true },
    { name: 'My Orders', icon: Package, path: '/orders', exact: true },
    { name: 'My Account', icon: User, path: '/account', exact: true }, 
  ];

  return (
    <div className="w-64 bg-[#084b57] border-r border-white/10 h-screen flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6 flex items-center gap-3">
        <img src={logo} alt="Galatic Logo" className="w-12 h-12 object-contain rounded-full bg-white/10 p-1" />
        <div>
          <h1 className="text-white font-bold text-xl leading-tight">GALATIC</h1>
          <h2 className="text-galatic-sky text-xs tracking-widest uppercase font-bold">Store</h2>
        </div>
      </div>

      <nav className="flex-1 px-4 mt-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.exact}
            className={({ isActive }) =>
              `flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-galatic-slate text-white shadow-lg' 
                  : 'text-galatic-sky hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </div>
            {item.badge > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-300 hover:bg-red-400/20 transition-colors font-bold"
        >
          <LogOut className="w-5 h-5" />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
}