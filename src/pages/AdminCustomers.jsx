import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Edit, Trash2 } from 'lucide-react';
import { db } from '../firebase';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import AdminSidebar from '../components/AdminSidebar';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      usersList.sort((a, b) => {
        if (a.role === 'Admin' && b.role !== 'Admin') return -1;
        if (a.role !== 'Admin' && b.role === 'Admin') return 1;
        return 0;
      });
      setCustomers(usersList);
    } catch (error) {
      console.error("Error fetching users: ", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleDelete = (id) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <span className="font-bold text-white">Delete this customer?</span>
        <p className="text-sm text-galatic-sky">This action cannot be undone.</p>
        <div className="flex gap-2 justify-end">
          <button onClick={() => toast.dismiss(t.id)} className="bg-galatic-slate px-3 py-1 rounded text-white text-sm">Cancel</button>
          <button onClick={async () => {
            toast.dismiss(t.id);
            try {
              await deleteDoc(doc(db, "users", id));
              setCustomers(customers.filter(c => c.id !== id));
              toast.success("Customer deleted.");
            } catch (error) {
              toast.error("Error deleting customer.");
            }
          }} className="bg-red-500 px-3 py-1 rounded text-white text-sm font-bold">Delete</button>
        </div>
      </div>
    ), { duration: 5000 });
  };

  return (
    <div className="flex min-h-screen bg-galatic-navy text-white">
      <AdminSidebar />
      <div className="ml-64 flex-1 p-8">
        <div className="flex items-center gap-3 mb-8">
          <Users className="w-8 h-8 text-galatic-cream" />
          <h1 className="text-3xl font-bold text-galatic-cream">Customer Database</h1>
        </div>

        <div className="bg-galatic-slate/20 rounded-2xl border border-galatic-slate/50 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-galatic-sky">Loading database...</div>
          ) : customers.length === 0 ? (
             <div className="p-8 text-center text-galatic-sky">No users found in database.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-galatic-slate/40 border-b border-galatic-slate/50 text-galatic-sky text-sm">
                  <th className="p-4 font-medium">Name / Email</th>
                  <th className="p-4 font-medium">Joined Date</th>
                  <th className="p-4 font-medium">Role</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="border-b border-galatic-slate/20 hover:bg-galatic-slate/10 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-white">{customer.name || 'Unknown'}</p>
                      <p className="text-sm text-galatic-sky/70">{customer.email}</p>
                    </td>
                    <td className="p-4 text-galatic-sky/70">{customer.joinedDate || 'N/A'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${customer.role === 'Admin' ? 'bg-purple-400/20 text-purple-400' : 'bg-blue-400/20 text-blue-400'}`}>
                        {customer.role || 'Customer'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${customer.status === 'Active' ? 'bg-green-400/20 text-green-400' : 'bg-red-400/20 text-red-400'}`}>
                        {customer.status || 'Active'}
                      </span>
                    </td>
                    <td className="p-4 flex justify-end gap-2">
                      <Link to={`/customers/edit/${customer.id}`} className="p-2 bg-galatic-slate/30 rounded hover:bg-galatic-sky/20 text-galatic-sky transition-colors" title="Edit">
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button onClick={() => handleDelete(customer.id)} className="p-2 bg-red-500/10 rounded hover:bg-red-500/30 text-red-400 transition-colors" title="Delete">
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