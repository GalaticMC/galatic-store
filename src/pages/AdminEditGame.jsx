import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AdminSidebar from '../components/AdminSidebar';
import { ArrowLeft, Save, Upload, Loader } from 'lucide-react';

// ⚠️ REPLACE THESE WITH YOUR CLOUDINARY DETAILS
const CLOUDINARY_CLOUD_NAME = "YOUR_CLOUD_NAME";
const CLOUDINARY_UPLOAD_PRESET = "YOUR_UNSIGNED_PRESET";

export default function AdminEditGame() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [oldPrice, setOldPrice] = useState('');
  const [discount, setDiscount] = useState(''); 
  const [image, setImage] = useState('');
  const [bannerImage, setBannerImage] = useState('');
  const [trailerLink, setTrailerLink] = useState(''); 
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [stock, setStock] = useState(0); 
  
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBigDiscount, setIsBigDiscount] = useState(false);
  const [isRecommended, setIsRecommended] = useState(false);
  const [isMostSelling, setIsMostSelling] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(collection(db, "categories"), orderBy("name"));
        const catSnapshot = await getDocs(q);
        const cats = catSnapshot.docs.map(doc => doc.data().name);
        setCategories(cats);

        const docRef = doc(db, "games", id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setTitle(data.title || '');
          setPrice(data.price || '');
          setOldPrice(data.oldPrice || '');
          setDiscount(data.discount || '');
          setImage(data.image || '');
          setBannerImage(data.bannerImage || '');
          setTrailerLink(data.trailerLink || ''); 
          setCategory(data.category || (cats.length > 0 ? cats[0] : ''));
          setStock(data.stock || 0);
          setIsFeatured(data.isFeatured || false);
          setIsBigDiscount(data.isBigDiscount || false);
          setIsRecommended(data.isRecommended || false);
          setIsMostSelling(data.isMostSelling || false);
        } else {
          toast.error("Game not found!");
          navigate('/');
        }
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
      setLoading(false);
    };
    fetchData();
  }, [id, navigate]);

  useEffect(() => {
    const cleanPrice = parseFloat(price.replace(/[^0-9.]/g, ''));
    const cleanOldPrice = parseFloat(oldPrice.replace(/[^0-9.]/g, ''));

    if (cleanPrice && cleanOldPrice && cleanOldPrice > cleanPrice) {
      const discountAmount = cleanOldPrice - cleanPrice;
      const discountPercentage = Math.round((discountAmount / cleanOldPrice) * 100);
      setDiscount(`${discountPercentage}% OFF`);
    } else if (!oldPrice) {
      setDiscount(''); 
    }
  }, [price, oldPrice]);

  // CLOUDINARY IMAGE UPLOAD FUNCTION
  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );
      const data = await res.json();
      
      if (data.secure_url) {
        if (type === 'thumbnail') setImage(data.secure_url);
        if (type === 'banner') setBannerImage(data.secure_url);
        toast.success("Image uploaded successfully!");
      } else {
        toast.error("Upload failed. Check your Cloudinary preset.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isFeatured) {
        const gamesRef = collection(db, "games");
        const q = query(gamesRef, where("isFeatured", "==", true));
        const querySnapshot = await getDocs(q);
        const unfeaturePromises = querySnapshot.docs.map(doc => {
          if (doc.id !== id) {
            return updateDoc(doc.ref, { isFeatured: false });
          }
          return Promise.resolve();
        });
        await Promise.all(unfeaturePromises);
      }

      const gameRef = doc(db, "games", id);
      await updateDoc(gameRef, {
        title,
        price,
        oldPrice: oldPrice || null,
        discount: discount || null,
        image,
        stock: Number(stock),
        bannerImage: isFeatured ? bannerImage : null,
        trailerLink: isFeatured ? trailerLink : null,
        category,
        isFeatured,
        isBigDiscount,
        isRecommended,
        isMostSelling,
      });
      
      toast.success("Game updated successfully!");
      navigate('/');
    } catch (error) {
      console.error("Error updating game: ", error);
      toast.error("Error updating game.");
    }
    setLoading(false);
  };

  if (loading) return <div className="min-h-screen bg-galatic-navy text-white flex items-center justify-center">Loading...</div>;

  return (
    <div className="flex min-h-screen bg-galatic-navy text-white">
      <AdminSidebar />

      <div className="ml-64 flex-1 p-8 flex justify-center items-start">
        <div className="w-full max-w-3xl bg-galatic-slate/20 p-8 rounded-2xl border border-galatic-slate/50 mt-8">
          
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-galatic-sky hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-5 h-5" /> Back to Dashboard
          </button>

          <div className="flex items-center gap-3 mb-6">
            <Save className="w-8 h-8 text-galatic-cream" />
            <h1 className="text-3xl font-bold text-galatic-cream">Edit Game</h1>
          </div>

          <form onSubmit={handleUpdate} className="space-y-5">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm mb-1 text-galatic-sky">Game Title</label>
                <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-galatic-navy border border-galatic-slate rounded-lg p-3 text-white focus:outline-none focus:border-galatic-sky" />
              </div>
              <div className="w-1/3">
                <label className="block text-sm mb-1 text-galatic-sky">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-galatic-navy border border-galatic-slate rounded-lg p-3 text-white focus:outline-none focus:border-galatic-sky">
                  {categories.map((cat, index) => (
                    <option key={index} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm mb-1 text-galatic-sky">Current Price</label>
                <input required type="text" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full bg-galatic-navy border border-galatic-slate rounded-lg p-3 text-white focus:outline-none focus:border-galatic-sky" />
              </div>
              <div className="flex-1">
                <label className="block text-sm mb-1 text-galatic-sky">Old Price (Optional)</label>
                <input type="text" value={oldPrice} onChange={(e) => setOldPrice(e.target.value)} className="w-full bg-galatic-navy border border-galatic-slate rounded-lg p-3 text-white focus:outline-none focus:border-galatic-sky" />
              </div>
              <div className="flex-1">
                <label className="block text-sm mb-1 text-galatic-sky">Discount (Auto)</label>
                <input readOnly type="text" value={discount} className="w-full bg-galatic-navy/50 border border-galatic-slate/50 rounded-lg p-3 text-green-400 font-bold focus:outline-none cursor-not-allowed" placeholder="Auto" />
              </div>
              <div className="w-1/4">
                <label className="block text-sm mb-1 text-galatic-sky">Stock</label>
                <input required type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full bg-galatic-navy border border-galatic-slate rounded-lg p-3 text-white focus:outline-none focus:border-galatic-sky" />
              </div>
            </div>

            {/* THUMBNAIL UPLOAD */}
            <div>
              <label className="block text-sm mb-1 text-galatic-sky">Product Image (Thumbnail)</label>
              <div className="flex gap-4 items-center">
                {image && (
                  <img src={image} alt="Preview" className="w-16 h-16 rounded object-cover border border-galatic-slate" />
                )}
                <label className="flex-1 cursor-pointer bg-galatic-navy border border-galatic-slate border-dashed rounded-lg p-3 text-center hover:border-galatic-sky transition-colors">
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'thumbnail')} className="hidden" />
                  <div className="flex items-center justify-center gap-2 text-galatic-sky">
                    {uploading ? <Loader className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                    {uploading ? 'Uploading to Cloudinary...' : 'Upload from Device'}
                  </div>
                </label>
              </div>
            </div>

            <div className="bg-galatic-navy/50 p-4 rounded-lg border border-galatic-slate/50 space-y-3">
              <p className="text-sm font-bold text-galatic-cream mb-2">Where should this game appear?</p>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="w-5 h-5 accent-galatic-cream" />
                <span>Featured (Main Banner)</span>
              </label>
              
              {isFeatured && (
                <div className="pl-8 pt-2 space-y-4 border-l-2 border-galatic-slate/50 ml-2">
                  {/* BANNER UPLOAD */}
                  <div>
                    <label className="block text-sm mb-1 text-galatic-sky">Banner Image (Wide Image)</label>
                    <div className="flex gap-4 items-center">
                      {bannerImage && (
                        <img src={bannerImage} alt="Banner Preview" className="w-24 h-12 rounded object-cover border border-galatic-slate" />
                      )}
                      <label className="flex-1 cursor-pointer bg-galatic-navy border border-galatic-slate border-dashed rounded-lg p-2 text-center hover:border-galatic-sky transition-colors">
                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'banner')} className="hidden" />
                        <div className="flex items-center justify-center gap-2 text-galatic-sky text-sm">
                          {uploading ? <Loader className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                          {uploading ? 'Uploading...' : 'Upload Banner'}
                        </div>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm mb-1 text-galatic-sky">Watch Trailer Link (YouTube URL)</label>
                    <input type="url" value={trailerLink} onChange={(e) => setTrailerLink(e.target.value)} className="w-full bg-galatic-navy border border-galatic-slate rounded-lg p-3 text-white focus:outline-none focus:border-galatic-sky" placeholder="https://youtube.com/watch?v=..." />
                  </div>
                </div>
              )}

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

            <div className="flex gap-4 pt-4">
              <button type="button" onClick={() => navigate('/')} className="flex-1 bg-galatic-slate/40 text-white font-bold py-4 rounded-xl hover:bg-galatic-slate transition-all">Cancel</button>
              <button disabled={loading || uploading} type="submit" className="flex-1 bg-galatic-cream text-galatic-navy font-bold py-4 rounded-xl hover:bg-white transition-all shadow-[0_0_15px_rgba(255,235,194,0.3)]">
                {loading ? "Updating..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}