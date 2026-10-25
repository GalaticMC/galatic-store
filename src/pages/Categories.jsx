import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Gamepad2, Loader } from 'lucide-react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "categories"));
        setCategories(querySnapshot.docs.map(doc => doc.data().name));
      } catch (error) {
        console.error("Error fetching categories: ", error);
      }
      setLoading(false);
    };
    fetchCategories();
  }, []);

  return (
    <div className="flex min-h-screen bg-galatic-navy text-galatic-sky">
      <Sidebar />
      
      <main className="ml-64 flex-1 p-8">
        <h1 className="text-3xl font-bold text-galatic-cream mb-8 flex items-center gap-3">
          <Gamepad2 className="w-8 h-8" /> Browse Categories
        </h1>

        {loading ? (
          <div className="flex items-center gap-3 text-galatic-sky text-xl">
            <Loader className="w-6 h-6 animate-spin" /> Loading categories...
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-20 bg-galatic-slate/10 rounded-2xl border border-galatic-slate/20">
            <p className="text-galatic-sky text-xl">No categories found in the database.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat, index) => (
              <button
                key={index}
                onClick={() => navigate(`/store/games?category=${cat}`)}
                className="bg-galatic-slate/10 border border-galatic-slate/30 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 hover:bg-galatic-slate/30 hover:border-galatic-sky/50 transition-all duration-300 transform hover:-translate-y-1 group"
              >
                <div className="p-4 bg-galatic-navy/50 rounded-full group-hover:bg-galatic-slate transition-colors">
                  <Gamepad2 className="w-8 h-8 text-galatic-cream" />
                </div>
                <h3 className="text-white font-bold text-xl">{cat}</h3>
                <p className="text-galatic-sky/70 text-sm">Explore Games</p>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}