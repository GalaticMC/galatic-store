import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Search, ShoppingCart, Filter } from 'lucide-react';
import { db, auth } from '../firebase';
import { collection, getDocs, setDoc, doc } from 'firebase/firestore';
import toast from 'react-hot-toast';

export default function Store() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const filterType = searchParams.get('filter');
  const categoryFilter = searchParams.get('category');

  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "games"));
        let gamesList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (filterType === 'bigdiscount') {
          gamesList = gamesList.filter(g => g.isBigDiscount);
        } else if (filterType === 'recommended') {
          gamesList = gamesList.filter(g => g.isRecommended);
        } else if (filterType === 'mostselling') {
          gamesList = gamesList.filter(g => g.isMostSelling);
        } else if (categoryFilter) {
          gamesList = gamesList.filter(g => g.category === categoryFilter);
        }

        setGames(gamesList);
      } catch (error) {
        console.error("Error fetching games: ", error);
      }
      setLoading(false);
    };
    fetchGames();
  }, [filterType, categoryFilter]);

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

  const getPageTitle = () => {
    if (filterType === 'bigdiscount') return 'Biggest Discounts';
    if (filterType === 'recommended') return 'Recommended Games';
    if (filterType === 'mostselling') return 'Most Selling Games';
    if (categoryFilter) return `${categoryFilter} Games`;
    return 'All Games';
  };

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
          <h1 className="text-3xl font-bold text-galatic-cream">{getPageTitle()}</h1>
          <div className="relative w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-galatic-sky/50" />
            <input type="text" placeholder="Search..." className="w-full bg-galatic-slate/20 border border-galatic-slate/30 rounded-full py-2.5 pl-12 pr-4 text-white focus:outline-none focus:border-galatic-sky transition-colors" />
          </div>
        </header>

        {loading ? (
          <div className="text-center py-20 text-galatic-sky text-xl">Loading games...</div>
        ) : games.length === 0 ? (
          <div className="text-center py-20 bg-galatic-slate/10 rounded-2xl border border-galatic-slate/20">
            <Filter className="w-12 h-12 text-galatic-slate mx-auto mb-4" />
            <p className="text-galatic-sky text-xl mb-2">No games found for this filter.</p>
            <Link to="/store" className="text-galatic-cream hover:underline">Back to Store</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {games.map((game) => <GameCard key={game.id} game={game} />)}
          </div>
        )}
      </main>
    </div>
  );
}