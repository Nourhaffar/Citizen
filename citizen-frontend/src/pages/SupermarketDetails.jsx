import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Store } from 'lucide-react';
import ProductGrid from '../components/ProductGrid';
import { supermarketService } from '../services';

const SupermarketDetails = () => {
  const { id } = useParams();
  const [supermarket, setSupermarket] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSupermarket = async () => {
      try {
        const [supermarketResponse, productsResponse] = await Promise.all([
          supermarketService.getById(id),
          supermarketService.getProducts(id, { limit: 100 }),
        ]);

        setSupermarket(supermarketResponse.data);
        setProducts(productsResponse.data || []);
      } catch (error) {
        console.error('Error fetching supermarket details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSupermarket();
  }, [id]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link
        to="/supermarkets"
        className="mb-8 inline-flex items-center gap-2 text-gray-600 transition-colors hover:text-primary-600"
      >
        <ArrowLeft size={18} />
        Back to supermarkets
      </Link>

      <div className="rounded-3xl bg-white p-8 shadow-md">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 text-primary-600">
              <Store size={30} />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">
              {supermarket?.name || 'Supermarket'}
            </h1>
            <p className="mt-3 max-w-2xl text-gray-600">
              {supermarket?.description || 'Products available from this supermarket on the Citizen platform.'}
            </p>
          </div>

          {supermarket?.address && (
            <div className="rounded-2xl bg-gray-50 px-5 py-4 text-sm text-gray-600">
              <div className="font-semibold text-gray-800">Store Address</div>
              <div className="mt-1">{supermarket.address}</div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8">
        <ProductGrid products={products} loading={loading} title="Available Products" />
      </div>
    </div>
  );
};

export default SupermarketDetails;
