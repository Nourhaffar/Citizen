import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingCart, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { supermarketService } from '../services';

const Cart = () => {
  const { items, updateQuantity, removeItem, clearCart } = useCart();
  const [supermarkets, setSupermarkets] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchSupermarkets();
  }, []);

  const fetchSupermarkets = async () => {
    try {
      const response = await supermarketService.getAll();
      const超市Map = {};
      (response.data.supermarkets || []).forEach(s => {
        超市Map[s.id] = s;
      });
      setSupermarkets(超市Map);
    } catch (error) {
      console.error('Error fetching supermarkets:', error);
    }
  };

  const groupedItems = items.reduce((acc, item) => {
    const supermarketId = item.supermarket_id;
    if (!acc[supermarketId]) {
      acc[supermarketId] = [];
    }
    acc[supermarketId].push(item);
    return acc;
  }, {});

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await updateQuantity(itemId, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await removeItem(itemId);
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <ShoppingCart size={64} className="mx-auto text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Your Cart is Empty</h1>
        <p className="text-gray-600 mb-6">
          Looks like you haven't added anything to your cart yet.
        </p>
        <Link
          to="/categories"
          className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-block"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link
        to="/categories"
        className="inline-flex items-center text-gray-600 hover:text-primary-600 mb-8 transition-colors"
      >
        <ArrowLeft size={20} className="mr-2" />
        Continue Shopping
      </Link>

      <h1 className="text-3xl font-bold text-gray-800 mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {Object.entries(groupedItems).map(([supermarketId, items]) => (
            <div key={supermarketId} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-primary-100 to-secondary-100 px-6 py-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  {supermarkets[supermarketId]?.name || `Supermarket ${supermarketId}`}
                </h2>
              </div>
              
              <div className="divide-y">
                {items.map((item) => (
                  <div key={item.id} className="p-6 flex gap-4">
                    {/* Product Image */}
                    <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/100x100?text=No+Image';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          No Image
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1">
                      <Link
                        to={`/product/${item.product_id}`}
                        className="text-lg font-semibold text-gray-800 hover:text-primary-600 transition-colors"
                      >
                        {item.name}
                      </Link>
                      <p className="text-gray-500 text-sm mt-1">
                        ${item.price?.toFixed(2)} each
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3 mt-3">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center justify-center transition-colors"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="text-lg font-semibold w-12 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center justify-center transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Price and Remove */}
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary-600 mb-2">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-500 hover:text-red-700 transition-colors p-2"
                        title="Remove item"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                <span>${calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span>$5.99</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold text-gray-800">
                  <span>Total</span>
                  <span>${(calculateSubtotal() + 5.99).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg font-semibold transition-colors mb-4"
            >
              Proceed to Checkout
            </button>

            <button
              onClick={clearCart}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold transition-colors"
            >
              Clear Cart
            </button>

            {/* Multi-vendor Notice */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Your order contains products from multiple supermarkets. 
                All items will be delivered together in a single delivery.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
