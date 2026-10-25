import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import toast from 'react-hot-toast';
import AdminSidebar from '../components/AdminSidebar'; // IMPORT COMPONENT
import { Save } from 'lucide-react';

export default function AdminEditCustomer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', role: 'Customer', status: 'Active', totalSpent: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const docRef = doc(db, "users", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setFormData(docSnap.data());
      } else {
        toast.error("User not found!");
        navigate('/admin/customers');
      }
      setLoading(false);
    };
    fetchUser();
  }, [id, navigate]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const userRef = doc(db, "users", id);
      await updateDoc(userRef, {
        name: formData.name,
        role: formData.role,
        status: formData.status,
        totalSpent: formData.totalSpent
      });
      toast.success("Customer updated successfully!");
      navigate('/admin/customers');
    } catch (error) {
      console.error("Error updating: ", error);
      toast.error("Failed to update customer.");
    }
  };

  if (loading) return <div className="min-h-screen bg-galatic-navy text-white flex items-center justify-center">Loading...</div>;

  return (
    <div className="flex min-h-screen bg-galatic-navy text-white">
      
      <AdminSidebar /> {/* USE COMPONENT */}

      <div className="ml-64 flex-1 p-8 flex justify-center items-start">
        <div className="w-full max-w-xl bg-galatic-slate/20 p-8 rounded-2xl border border-galatic-slate/50 mt-8">
          <h1 className="text-3xl font-bold mb-6 text-galatic-cream">Edit Customer</h1>
          
          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-sm mb-1 text-galatic-sky">Full Name</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-galatic-navy border border-galatic-slate rounded-lg p-3 text-white focus:outline-none focus:border-galatic-sky" />
            </div>

            <div>
              <label className="block text-sm mb-1 text-galatic-sky">Email (Read Only)</label>
              <input type="email" readOnly value={formData.email} className="w-full bg-galatic-navy/50 border border-galatic-slate/50 rounded-lg p-3 text-galatic-sky/50 cursor-not-allowed" />
            </div>

            <div>
              <label className="block text-sm mb-1 text-galatic-sky">Role</label>
              <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="w-full bg-galatic-navy border border-galatic-slate rounded-lg p-3 text-white focus:outline-none focus:border-galatic-sky">
                <option value="Customer">Customer</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm mb-1 text-galatic-sky">Account Status</label>
              <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full bg-galatic-navy border border-galatic-slate rounded-lg p-3 text-white focus:outline-none focus:border-galatic-sky">
                <option value="Active">Active</option>
                <option value="Banned">Banned</option>
              </select>
            </div>

            <div>
              <label className="block text-sm mb-1 text-galatic-sky">Total Spent</label>
              <input type="text" value={formData.totalSpent} onChange={(e) => setFormData({...formData, totalSpent: e.target.value})} className="w-full bg-galatic-navy border border-galatic-slate rounded-lg p-3 text-white focus:outline-none focus:border-galatic-sky" placeholder="e.g. ৳4,500" />
            </div>

            <div className="flex gap-4 pt-4">
              <button type="button" onClick={() => navigate('/admin/customers')} className="flex-1 bg-galatic-slate/40 text-white font-bold py-3 rounded-xl hover:bg-galatic-slate transition-all">Cancel</button>
              <button type="submit" className="flex-1 bg-galatic-cream text-galatic-navy font-bold py-3 rounded-xl hover:bg-white transition-all flex justify-center items-center gap-2"><Save className="w-5 h-5" /> Save Changes</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}