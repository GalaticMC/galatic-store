import { NavLink, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { 
  ArrowLeft, LayoutDashboard, PlusCircle, Users, ShoppingCart, 
  MessageSquare, LogOut, Gamepad2, Wallet 
} from 'lucide-react';
import logo from '../assets/logo.png';

export default function AdminSidebar() {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    signOut(auth).then(() => navigate('/login'));
  };

  return (
    <div className="w-64 bg-[#084b57] border-r border-white/10 flex flex-col fixed h-screen z-50">
      <div className="p-6 border-b border-white/10 flex items-center gap-3">
        <img src={logo} alt="Galatic Logo" className="w-10 h-10 object-contain rounded-full bg-white/10 p-1" />
        <div>
          <h1 className="text-xl font-bold text-white leading-tight">Admin</h1>
          <p className="text-xs text-galatic-sky">Panel</p>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <NavLink to="/" end className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-galatic-slate text-white' : 'text-galatic-sky hover:bg-white/10 hover:text-white'}`}>
          <LayoutDashboard className="w-5 h-5" /> Dashboard
        </NavLink>
        <NavLink to="/add-game" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-galatic-slate text-white' : 'text-galatic-sky hover:bg-white/10 hover:text-white'}`}>
          <PlusCircle className="w-5 h-5" /> Add Products
        </NavLink>
        <NavLink to="/categories" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-galatic-slate text-white' : 'text-galatic-sky hover:bg-white/10 hover:text-white'}`}>
          <Gamepad2 className="w-5 h-5" /> Categories
        </NavLink>
        <NavLink to="/customers" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-galatic-slate text-white' : 'text-galatic-sky hover:bg-white/10 hover:text-white'}`}>
          <Users className="w-5 h-5" /> Customer Info
        </NavLink>
        <NavLink to="/orders" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-galatic-slate text-white' : 'text-galatic-sky hover:bg-white/10 hover:text-white'}`}>
          <ShoppingCart className="w-5 h-5" /> Orders
        </NavLink>
        <NavLink to="/carts" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-galatic-slate text-white' : 'text-galatic-sky hover:bg-white/10 hover:text-white'}`}>
          <ShoppingCart className="w-5 h-5" /> Active Carts
        </NavLink>
        <NavLink to="/topups" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-galatic-slate text-white' : 'text-galatic-sky hover:bg-white/10 hover:text-white'}`}>
          <Wallet className="w-5 h-5" /> Top-Ups
        </NavLink>
        <button className="flex items-center gap-3 px-4 py-3 w-full hover:bg-white/10 rounded-xl text-galatic-sky hover:text-white transition-colors text-left">
          <MessageSquare className="w-5 h-5" /> Helpline Chat
        </button>
      </nav>

      <div className="p-4 border-t border-white/10 space-y-2">
        <a href="https://store.galatic.indevs.in" className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-xl text-galatic-sky hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" /> Back to Store
        </a>
        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-300 hover:bg-red-400/20 transition-colors font-bold">
          <LogOut className="w-5 h-5" /> Log Out
        </button>
      </div>
    </div>
  );
}