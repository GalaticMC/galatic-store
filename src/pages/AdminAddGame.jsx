import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AdminSidebar from '../components/AdminSidebar'; // IMPORT COMPONENT
import { PlusCircle, Plus } from 'lucide-react';

export default function AdminAddGame() {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [oldPrice, setOldPrice] = useState('');
  const [discount, setDiscount] = useState(''); 
  const [image, setImage] = useState('');
  const [stock, setStock] = useState(0); 
  
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [showNewCatInput, setShowNewCatInput] = useState(false);

  const [isFeatured, setIsFeatured] = useState(false);
  const [isBigDiscount, setIsBigDiscount] = useState(false);
  const [isRecommended, setIsRecommended] = useState(false);
  const [isMostSelling, setIsMostSelling] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const q = query(collection(db, "categories"), orderBy("name"));
        const querySnapshot = await getDocs(q);
        const cats = querySnapshot.docs.map(doc => doc.data().name);
        setCategories(cats);
        if (cats.length > 0) setCategory(cats[0]);
      } catch (error) {
        console.error("Error fetching categories: ", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const cleanPrice = parseFloat(price.replace(/[^0-9.]/g, ''));
    const cleanOldPrice = parseFloat(oldPrice.replace(/[^0-9.]/g, ''));

    if (cleanPrice && cleanOldPrice && cleanOldPrice > cleanPrice) {
      const discountAmount = cleanOldPrice - cleanPrice;
      const discountPercentage = Math.round((discountAmount / cleanOldPrice) * 100);
      setDiscount(`${discountPercentage}% OFF`);
    } else {
      setDiscount(''); 
    }
  }, [price, oldPrice]);

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      await addDoc(collection(db, "categories"), { name: newCategory.trim() });
      setCategories([...categories, newCategory.trim()].sort());
      setCategory(newCategory.trim());
      setNewCategory('');
      setShowNewCatInput(false);
      toast.success("Category added!");
    } catch (error) {
      console.error("Error adding category: ", error);
      toast.error("Failed to add category.");
    }
  };

  const handleAddGame = async (e) => {
    e.preventDefault();
    if (!category) {
      toast.error("Please add a category first before publishing a game.");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "games"), {
        title,
        price,
        oldPrice: oldPrice || null,
        discount: discount || null,
        image,
        stock: Number(stock),
        category,
        isFeatured,
        isBigDiscount,
        isRecommended,
        isMostSelling,
        createdAt: new Date()
      });
      toast.success("Game added successfully!");
      navigate('/admin');
    } catch (error) {
      console.error("Error adding game: ", error);
      toast.error("Error adding game.");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen bg-galatic-navy text-white">
      
      <AdminSidebar /> {/* USE COMPONENT */}

      <div className="ml-64 flex-1 p-8 flex justify-center items-start">
        <div className="w-full max-w-3xl bg-galatic-slate/20 p-8 rounded-2xl border border-galatic-slate/50 mt-8">
          <div className="flex items-center gap-3 mb-6">
            <PlusCircle className="w-8 h-8 text-galatic-cream" />
            <h1 className="text-3xl font-bold text-galatic-cream">Add New Game</h1>
          </div>

          <form onSubmit={handleAddGame} className="space-y-5">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm mb-1 text-galatic-sky">Game Title</label>
                <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-galatic-navy border border-galatic-slate rounded-lg p-3 text-white focus:outline-none focus:border-galatic-sky" placeholder="e.g. Minecraft" />
              </div>
              <div className="w-1/3">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm text-galatic-sky">Category</label>
                  <button type="button" onClick={() => setShowNewCatInput(!showNewCatInput)} className="text-xs text-galatic-cream hover:underline flex items-center gap-1">
                    <Plus className="w-3 h-3" /> New
                  </button>
                </div>
                {showNewCatInput ? (
                  <div className="flex gap-2">
                    <input type="text" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="w-full bg-galatic-navy border border-galatic-slate rounded-lg p-2 text-sm text-white focus:outline-none focus:border-galatic-sky" placeholder="Category Name" />
                    <button type="button" onClick={handleAddCategory} className="bg-galatic-cream text-galatic-navy px-3 rounded-lg font-bold text-sm">Add</button>
                  </div>
                ) : (
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-galatic-navy border border-galatic-slate rounded-lg p-3 text-white focus:outline-none focus:border-galatic-sky">
                    {categories.length === 0 && <option value="">-- No Categories. Click + New --</option>}
                    {categories.map((cat, index) => (
                      <option key={index} value={cat}>{cat}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm mb-1 text-galatic-sky">Current Price</label>
                <input required type="text" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full bg-galatic-navy border border-galatic-slate rounded-lg p-3 text-white focus:outline-none focus:border-galatic-sky" placeholder="1299" />
              </div>
              <div className="flex-1">
                <label className="block text-sm mb-1 text-galatic-sky">Old Price (Optional)</label>
                <input type="text" value={oldPrice} onChange={(e) => setOldPrice(e.target.value)} className="w-full bg-galatic-navy border border-galatic-slate rounded-lg p-3 text-white focus:outline-none focus:border-galatic-sky" placeholder="3699" />
              </div>
              <div className="flex-1">
                <label className="block text-sm mb-1 text-galatic-sky">Discount (Auto)</label>
                <input readOnly type="text" value={discount} className="w-full bg-galatic-navy/50 border border-galatic-slate/50 rounded-lg p-3 text-green-400 font-bold focus:outline-none cursor-not-allowed" placeholder="Auto" />
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-1/3">
                <label className="block text-sm mb-1 text-galatic-sky">Stock Quantity</label>
                <input required type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full bg-galatic-navy border border-galatic-slate rounded-lg p-3 text-white focus:outline-none focus:border-galatic-sky" placeholder="0" />
              </div>
              <div className="flex-1">
                <label className="block text-sm mb-1 text-galatic-sky">Image URL</label>
                <input required type="url" value={image} onChange={(e) => setImage(e.target.value)} className="w-full bg-galatic-navy border border-galatic-slate rounded-lg p-3 text-white focus:outline-none focus:border-galatic-sky" placeholder="https://..." />
              </div>
            </div>

            <div className="bg-galatic-navy/50 p-4 rounded-lg border border-galatic-slate/50 space-y-3">
              <p className="text-sm font-bold text-galatic-cream mb-2">Where should this game appear?</p>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="w-5 h-5 accent-galatic-cream" />
                <span>Featured (Main Banner)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={isBigDiscount} onChange={(e) => setIsBigDiscount(e.target.checked)} className="w-5 h-5 accent-galatic-cream" />
                <span>Show in "Big Discounts" Section</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={isRecommended} onChange={(e) => setIsRecommended(e.target.checked)} className="w-5 h-5 accent-galatic-cream" />
                <span>Recommended Section</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={isMostSelling} onChange={(e) => setIsMostSelling(e.target.checked)} className="w-5 h-5 accent-galatic-cream" />
                <span>Most Selling Section</span>
              </label>
            </div>

            <button disabled={loading} type="submit" className="w-full bg-galatic-cream text-galatic-navy font-bold py-4 rounded-xl hover:bg-white transition-all mt-6 shadow-[0_0_15px_rgba(255,235,194,0.3)]">
              {loading ? "Saving to Database..." : "Publish Game to Store"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}