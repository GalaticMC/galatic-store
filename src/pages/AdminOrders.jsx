import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import AdminSidebar from '../components/AdminSidebar';
import toast from 'react-hot-toast';
import { ShoppingCart, ChevronRight, Search, Filter, Trash2, ChevronDown } from 'lucide-react';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "orders"), (querySnapshot) => {
      const ordersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      ordersList.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setOrders(ordersList);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    toast((t) => (
      <div className="flex flex-col gap-3">
        <span className="font-bold text-white">Delete this order permanently?</span>
        <div className="flex gap-2 justify-end">
          <button onClick={() => toast.dismiss(t.id)} className="bg-galatic-slate px-3 py-1 rounded text-white text-sm">Cancel</button>
          <button onClick={async () => {
            toast.dismiss(t.id);
            try {
              await deleteDoc(doc(db, "orders", id));
              toast.success("Order deleted.");
            } catch (error) {
              toast.error("Failed to delete order.");
            }
          }} className="bg-red-500 px-3 py-1 rounded text-white text-sm font-bold">Delete</button>
        </div>
      </div>
    ), { duration: 5000 });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
      case 'Paid':
        return 'bg-green-400/20 text-green-400';
      case 'Unpaid':
        return 'bg-orange-400/20 text-orange-400';
      case 'Cancelled':
        return 'bg-red-400/20 text-red-400';
      default:
        return 'bg-galatic-slate text-galatic-sky';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // REMOVED 'Pending' FROM THIS LIST
  const statuses = ['All', 'Paid', 'Unpaid', 'Completed', 'Cancelled'];

  return (
    <div className="flex min-h-screen bg-galatic-navy text-white">
      <AdminSidebar />
      <div className="ml-64 flex-1 p-8">
        <div className="flex items-center gap-3 mb-8">
          <ShoppingCart className="w-8 h-8 text-galatic-cream" />
          <h1 className="text-3xl font-bold text-galatic-cream">Customer Orders</h1>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-galatic-sky/50" />
            <input 
              type="text" 
              placeholder="Search by Order ID, Email, or User ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-galatic-slate/20 border border-galatic-slate/50 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-galatic-sky transition-colors"
            />
          </div>
          
          <div className="relative w-full md:w-64">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="w-full bg-galatic-slate/20 border border-galatic-slate/50 rounded-xl py-3 pl-12 pr-4 text-left text-white focus:outline-none focus:border-galatic-sky flex items-center justify-between"
            >
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-galatic-sky/50" />
              <span>{statusFilter === 'All' ? 'All Statuses' : statusFilter}</span>
              <ChevronDown className={`w-5 h-5 text-galatic-sky/50 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
            </button>

            {isFilterOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#021a2b] border border-galatic-slate/50 rounded-xl shadow-2xl z-50 overflow-hidden">
                {statuses.map(status => (
                  <button
                    key={status}
                    onClick={() => {
                      setStatusFilter(status);
                      setIsFilterOpen(false);
                    }}
                    className={`w-full text-left px-6 py-3 hover:bg-galatic-slate/40 transition-colors ${statusFilter === status ? 'bg-galatic-slate/60 text-galatic-cream font-bold' : 'text-galatic-sky'}`}
                  >
                    {status === 'All' ? 'All Statuses' : status}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center text-galatic-sky py-10">Loading orders...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center bg-galatic-slate/10 p-12 rounded-2xl border border-galatic-slate/30 text-galatic-sky">
              No orders found matching your search.
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div 
                key={order.id} 
                onClick={() => navigate(`/admin/orders/${order.id}`)}
                className="bg-galatic-slate/20 border border-galatic-slate/50 rounded-2xl p-6 cursor-pointer hover:bg-galatic-slate/30 hover:border-galatic-sky/50 transition-all duration-200 group relative"
              >
                <div className="flex justify-between items-start mb-4 border-b border-galatic-slate/30 pb-4">
                  <div>
                    <p className="text-sm text-galatic-sky/70">Customer: <span className="text-white font-bold">{order.userEmail}</span></p>
                    <p className="text-xs text-galatic-sky/50 mt-1">Order ID: {order.id}</p>
                  </div>
                  <div className="text-right flex flex-col items-end pr-12">
                    <p className="text-2xl font-bold text-green-400">৳{order.totalAmount}</p>
                    <span className={`inline-block mt-1 px-3 py-1 rounded text-xs font-bold ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm text-galatic-sky">
                      <span>{item.title}</span>
                      <span className="font-bold text-white">৳{item.price}</span>
                    </div>
                  ))}
                </div>

                <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
                  <button 
                    onClick={(e) => handleDelete(e, order.id)} 
                    className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete Order"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <ChevronRight className="w-8 h-8 text-galatic-cream opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}