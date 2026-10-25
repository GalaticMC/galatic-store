import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import AdminSidebar from '../components/AdminSidebar'; // IMPORT COMPONENT
import { Gamepad2, Plus, Trash2 } from 'lucide-react';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    setLoading(true);
    const querySnapshot = await getDocs(collection(db, "categories"));
    setCategories(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if(!newCategory.trim()) return;
    await addDoc(collection(db, "categories"), { name: newCategory.trim() });
    setNewCategory('');
    fetchCategories();
    toast.success("Category added!");
  };

  const handleDelete = (id) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <span className="font-bold text-white">Delete this category?</span>
        <div className="flex gap-2 justify-end">
          <button onClick={() => toast.dismiss(t.id)} className="bg-galatic-slate px-3 py-1 rounded text-white text-sm">Cancel</button>
          <button onClick={async () => {
            toast.dismiss(t.id);
            await deleteDoc(doc(db, "categories", id));
            fetchCategories();
            toast.success("Category deleted.");
          }} className="bg-red-500 px-3 py-1 rounded text-white text-sm font-bold">Delete</button>
        </div>
      </div>
    ), { duration: 5000 });
  };

  return (
    <div className="flex min-h-screen bg-galatic-navy text-white">
      
      <AdminSidebar /> {/* USE COMPONENT */}

      <div className="ml-64 flex-1 p-8">
        <div className="flex items-center gap-3 mb-8">
          <Gamepad2 className="w-8 h-8 text-galatic-cream" />
          <h1 className="text-3xl font-bold text-galatic-cream">Manage Categories</h1>
        </div>

        <div className="bg-galatic-slate/20 p-6 rounded-2xl border border-galatic-slate/50 mb-8 max-w-2xl">
          <form onSubmit={handleAdd} className="flex gap-4">
            <input type="text" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="Enter new category name..." className="flex-1 bg-galatic-navy border border-galatic-slate rounded-lg p-3 text-white focus:outline-none focus:border-galatic-sky" />
            <button type="submit" className="bg-galatic-cream text-galatic-navy px-6 rounded-lg font-bold flex items-center gap-2 hover:bg-white transition-all"><Plus className="w-5 h-5" /> Add</button>
          </form>
        </div>

        <div className="bg-galatic-slate/20 rounded-2xl border border-galatic-slate/50 overflow-hidden max-w-2xl">
          {loading ? (
             <div className="p-8 text-center text-galatic-sky">Loading...</div>
          ) : categories.length === 0 ? (
             <div className="p-8 text-center text-galatic-sky">No categories found. Add one above!</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-galatic-slate/40 border-b border-galatic-slate/50 text-galatic-sky text-sm">
                  <th className="p-4 font-medium">Category Name</th>
                  <th className="p-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id} className="border-b border-galatic-slate/20 hover:bg-galatic-slate/10 transition-colors">
                    <td className="p-4 font-bold text-white">{cat.name}</td>
                    <td className="p-4 flex justify-end">
                      <button onClick={() => handleDelete(cat.id)} className="p-2 bg-red-500/10 rounded hover:bg-red-500/30 text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
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