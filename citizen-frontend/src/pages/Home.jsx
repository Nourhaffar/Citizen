import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Carousel from '../components/Carousel';
import ProductGrid from '../components/ProductGrid';
import { productService, supermarketService } from '../services';
import { Store, TrendingUp, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const [bestSellingProducts, setBestSellingProducts] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [supermarkets, setSupermarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  const fetchData = async () => {
    try {
      const [bestSellingRes, recommendedRes, supermarketsRes] = await Promise.all([
        productService.getBestSelling({ limit: 8 }),
        productService.getRecommended(user?.id, { limit: 8 }),
        supermarketService.getAll(),
      ]);

      setBestSellingProducts(bestSellingRes.data || []);
      setRecommendedProducts(recommendedRes.data || []);
      setSupermarkets(supermarketsRes.data || []);
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero Section with Carousel */}
      <section className="mb-12">
        <Carousel />
      </section>

      {/* Best Selling Products */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="text-primary-600" size={28} />
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Best Selling Products</h2>
        </div>
        <ProductGrid 
          products={bestSellingProducts} 
          loading={loading}
        />
      </section>

      {/* Recommended Products */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="text-secondary-500" size={28} />
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Recommended For You</h2>
        </div>
        <ProductGrid 
          products={recommendedProducts} 
          loading={loading}
        />
      </section>

      {/* Supermarkets Section */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <Store className="text-primary-600" size={28} />
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Our Supermarkets</h2>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="h-24 bg-gray-200 rounded mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {supermarkets.map((supermarket) => (
              <Link
                key={supermarket.id}
                to={`/supermarkets/${supermarket.id}`}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="h-24 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-lg mb-4 flex items-center justify-center">
                  <Store size={48} className="text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {supermarket.name}
                </h3>
                <p className="text-gray-600 text-sm">
                  {supermarket.description?.substring(0, 80) || 'Quality products at great prices'}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary-600 to-secondary-500 rounded-lg p-8 md:p-12 text-center text-white mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Shop from Multiple Stores, One Delivery
        </h2>
        <p className="text-lg mb-6 opacity-90">
          Browse products from all your favorite supermarkets and get everything delivered in one go.
        </p>
        <Link
          to="/categories"
          className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
        >
          Start Shopping
        </Link>
      </section>
    </div>
  );
};

export default Home;
