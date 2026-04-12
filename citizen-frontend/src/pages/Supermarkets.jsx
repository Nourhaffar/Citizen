import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Store, MapPin } from 'lucide-react';
import { supermarketService } from '../services';

const Supermarkets = () => {
  const [supermarkets, setSupermarkets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSupermarkets = async () => {
      try {
        const response = await supermarketService.getAll();
        setSupermarkets(response.data || []);
      } catch (error) {
        console.error('Error fetching supermarkets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSupermarkets();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Supermarkets</h1>
        <p className="mt-2 text-gray-600">
          Browse the stores currently connected to the Citizen platform.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="h-56 rounded-2xl bg-white shadow-md animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {supermarkets.map((supermarket) => (
            <Link
              key={supermarket.id}
              to={`/supermarkets/${supermarket.id}`}
              className="rounded-2xl bg-white p-6 shadow-md transition-shadow hover:shadow-lg"
            >
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 text-primary-600">
                <Store size={30} />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">{supermarket.name}</h2>
              <p className="mt-3 text-sm leading-6 text-gray-600">
                {supermarket.description || 'Quality supermarket products delivered through Citizen.'}
              </p>
              <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                <MapPin size={16} />
                <span>{supermarket.address || 'Address available at checkout'}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Supermarkets;
