import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    try {
      await addToCart(product.id, 1, product.supermarket_id);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <Link to={`/product/${product.id}`}>
        <div className="relative h-48 bg-gray-200">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}
        </div>
      </Link>
      
      <div className="p-4">
        <Link to={`/product/${product.id}`}>
          <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2 hover:text-primary-600 transition-colors">
            {product.name}
          </h3>
        </Link>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description?.substring(0, 80)}...
        </p>
        
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-primary-600">
            ${product.price?.toFixed(2)}
          </span>
          
          <button
            onClick={handleAddToCart}
            className="bg-primary-600 hover:bg-primary-700 text-white p-2 rounded-lg transition-colors"
            title="Add to Cart"
          >
            <ShoppingCart size={20} />
          </button>
        </div>
        
        {product.supermarket_name && (
          <p className="text-xs text-gray-500 mt-2">
            Sold by: {product.supermarket_name}
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
