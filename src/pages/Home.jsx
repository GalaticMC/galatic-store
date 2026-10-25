import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Search, Bell, User, Play, ShoppingCart, X } from 'lucide-react';
import { db, auth } from '../firebase';
import { collection, getDocs, setDoc, doc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import toast from 'react-hot-toast';

export default function Home() {
  const [games, setGames] = useState([]);
  const [categories, setCategories] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const unsubscribeUser = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          }
        });
        return () => unsubscribeUser();
      }
    });

    const fetchData = async () => {
      try {
        const gamesSnapshot = await getDocs(collection(db, "games"));
        setGames(gamesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        const catSnapshot = await getDocs(collection(db, "categories"));
        setCategories(catSnapshot.docs.map(doc => doc.data().name));
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
      setLoading(false);
    };
    fetchData();

    return () => unsubscribeAuth();
  }, []);

  const addToCart = async (game) => {
    if (!auth.currentUser) {
      toast.error("Please log in to add to cart");
      navigate('/login');
      return;
    }
    try {
      await setDoc(doc(db, `carts/${auth.currentUser.uid}/items`, game.id), {
        gameId: game.id,
        title: game.title,
        price: game.price,
        image: game.image,
        category: game.category
      });
      toast.success(`${game.title} added to cart!`);
      navigate('/store/cart'); // REDIRECT TO CART
    } catch (error) {
      console.error("Cart error:", error);
      toast.error("Failed to add to cart");
    }
  };

  const filteredGames = games.filter(game => 
    game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    game.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const featuredGame = games.find(g => g.isFeatured);
  const bigDiscountGames = filteredGames.filter(g => g.isBigDiscount).slice(0, 4);
  const recommendedGames = filteredGames.filter(g => g.isRecommended).slice(0, 4);
  const mostSellingGames = filteredGames.filter(g => g.isMostSelling).slice(0, 4);

  const GameCard = ({ game }) => {
    const stockCount = game.stock !== undefined ? game.stock : 0;
    const isOutOfStock = stockCount <= 0;

    return (
      <div className="bg-galatic-slate/10 rounded-2xl overflow-hidden border border-galatic-slate/20 group hover:border-galatic-sky/50 transition-all duration-300 hover:-translate-y-1 relative flex flex-col">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img src={game.image} alt={game.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
          {game.discount && (
            <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              {game.discount}
            </span>
          )}
          {game.category && (
            <span className="absolute top-3 right-3 bg-galatic-navy/80 backdrop-blur-sm text-galatic-sky text-xs px-2 py-1 rounded border border-galatic-slate/50">
              {game.category}
            </span>
          )}
        </div>
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-white font-bold mb-2 truncate">{game.title}</h3>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-galatic-cream font-bold text-lg">৳{game.price}</span>
              {game.oldPrice && (
                <span className="text-galatic-sky/50 text-sm line-through">৳{game.oldPrice}</span>
              )}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className={`w-2 h-2 rounded-full ${isOutOfStock ? 'bg-red-500' : 'bg-green-400'}`}></span>
              <span className={`text-xs ${isOutOfStock ? 'text-red-400 font-bold' : 'text-galatic-sky/70'}`}>
                {isOutOfStock ? 'Out of Stock' : `In Stock: ${stockCount} left`}
              </span>
            </div>
            <button 
              onClick={() => addToCart(game)}
              disabled={isOutOfStock}
              className={`w-full py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                isOutOfStock ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed' : 'bg-galatic-cream text-galatic-navy hover:bg-white'
              }`}
            >
              <ShoppingCart className="w-4 h-4" /> Buy Now
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-galatic-navy text-galatic-sky">
      <Sidebar />
      <main className="ml-64 flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <div className="relative w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-galatic-sky/50" />
            <input 
              type="text" 
              placeholder="Search for games..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-galatic-slate/20 border border-galatic-slate/30 rounded-full py-2.5 pl-12 pr-10 text-white focus:outline-none focus:border-galatic-sky transition-colors" 
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-galatic-sky/50 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 bg-galatic-slate/20 rounded-full hover:bg-galatic-slate/40 transition-colors"><Bell className="w-5 h-5" /></button>
            <div 
              onClick={() => navigate('/store/account')}
              className="flex items-center gap-3 bg-galatic-slate/20 rounded-full pl-2 pr-4 py-1.5 border border-galatic-slate/30 cursor-pointer hover:bg-galatic-slate/40 transition-colors"
            >
              <div className="bg-galatic-cream p-1.5 rounded-full"><User className="w-4 h-4 text-galatic-navy" /></div>
              <div>
                <p className="text-xs text-galatic-sky/70">{userData?.name || 'Customer'}</p>
                <p className="text-sm font-bold text-green-400">{userData?.totalSpent || '৳0.00'}</p>
              </div>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="text-center py-20 text-galatic-sky text-xl">Loading Store Data...</div>
        ) : games.length === 0 ? (
           <div className="text-center py-20 bg-galatic-slate/10 rounded-2xl border border-galatic-slate/20">
            <p className="text-galatic-sky text-xl mb-4">The store is currently empty.</p>
            <a href="/admin/add-game" className="text-galatic-cream hover:underline">Go to Admin Panel to add games &rarr;</a>
          </div>
        ) : (
          <>
            {!searchTerm && featuredGame && (
              <section className="relative rounded-3xl overflow-hidden mb-10 h-[400px] group">
                <img src={featuredGame.bannerImage || featuredGame.image} alt="Featured" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-r from-galatic-navy via-galatic-navy/80 to-transparent"></div>
                <div className="absolute inset-0 p-12 flex flex-col justify-center max-w-2xl">
                  <span className="text-galatic-cream font-bold tracking-wider text-sm mb-2 uppercase">Featured Game</span>
                  <h1 className="text-5xl font-extrabold text-white mb-4 leading-tight">{featuredGame.title}</h1>
                  <p className="text-galatic-sky/80 mb-8 text-lg">Experience the ultimate {featuredGame.category} adventure.</p>
                  <div className="flex gap-4">
                    <button onClick={() => addToCart(featuredGame)} className="bg-galatic-cream text-galatic-navy px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-white transition-all transform hover:scale-105">
                      <ShoppingCart className="w-5 h-5" /> Buy Now - ৳{featuredGame.price}
                    </button>
                    {featuredGame.trailerLink && (
                      <a href={featuredGame.trailerLink} target="_blank" rel="noopener noreferrer" className="bg-galatic-slate/50 backdrop-blur-md text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-galatic-slate transition-colors">
                        <Play className="w-5 h-5" /> Watch Trailer
                      </a>
                    )}
                  </div>
                </div>
              </section>
            )}

            {!searchTerm && categories.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-white mb-4">Browse Categories</h2>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {categories.map((cat, index) => (
                    <button key={index} onClick={() => navigate(`/store/games?category=${cat}`)} className="px-6 py-3 bg-galatic-slate/20 border border-galatic-slate/50 rounded-xl whitespace-nowrap text-galatic-sky font-bold hover:bg-galatic-slate hover:text-white transition-all">
                      {cat}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {searchTerm ? (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-white mb-6">Search Results ({filteredGames.length})</h2>
                {filteredGames.length === 0 ? (
                   <div className="text-center py-12 bg-galatic-slate/10 rounded-2xl border border-galatic-slate/20">
                    <p className="text-galatic-sky text-xl">No games found matching "{searchTerm}"</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredGames.map((game) => <GameCard key={game.id} game={game} />)}
                  </div>
                )}
              </div>
            ) : (
              <>
                {bigDiscountGames.length > 0 && (
                  <section className="mb-12">
                    <div className="flex justify-between items-end mb-6">
                      <h2 className="text-2xl font-bold text-white flex items-center gap-2">🏷️ BIGGEST DISCOUNTS</h2>
                      <button onClick={() => navigate('/store/games?filter=bigdiscount')} className="text-galatic-sky hover:text-white text-sm font-medium">View All &gt;</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {bigDiscountGames.map((game) => <GameCard key={game.id} game={game} />)}
                    </div>
                  </section>
                )}

                {recommendedGames.length > 0 && (
                  <section className="mb-12">
                    <div className="flex justify-between items-end mb-6">
                      <h2 className="text-2xl font-bold text-white flex items-center gap-2">✨ RECOMMENDED</h2>
                      <button onClick={() => navigate('/store/games?filter=recommended')} className="text-galatic-sky hover:text-white text-sm font-medium">View All &gt;</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {recommendedGames.map((game) => <GameCard key={game.id} game={game} />)}
                    </div>
                  </section>
                )}

                {mostSellingGames.length > 0 && (
                  <section className="mb-12">
                    <div className="flex justify-between items-end mb-6">
                      <h2 className="text-2xl font-bold text-white flex items-center gap-2">🔥 MOST SELLING</h2>
                      <button onClick={() => navigate('/store/games?filter=mostselling')} className="text-galatic-sky hover:text-white text-sm font-medium">View All &gt;</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {mostSellingGames.map((game) => <GameCard key={game.id} game={game} />)}
                    </div>
                  </section>
                )}
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}