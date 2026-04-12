import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, ShoppingBag } from 'lucide-react';
import { orderService } from '../services';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Checkout = () => {
  const { isAuthenticated } = useAuth();
  const { items, totalItems, totalPrice, fetchCart } = useCart();
  const [formData, setFormData] = useState({
    street_address: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'USA',
    paymentMethod: 'card',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState(null);

  const taxAmount = useMemo(() => Number((Number(totalPrice || 0) * 0.08).toFixed(2)), [totalPrice]);
  const deliveryFee = 5.99;
  const grandTotal = Number((Number(totalPrice || 0) + deliveryFee + taxAmount).toFixed(2));

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await orderService.create({
        deliveryAddress: {
          street_address: formData.street_address,
          city: formData.city,
          state: formData.state,
          postal_code: formData.postal_code,
          country: formData.country,
        },
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
      });

      setOrder(response.data.order);
      await fetchCart();
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <CreditCard size={64} className="mx-auto text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Login required</h1>
        <p className="text-gray-600 mb-6">
          Checkout uses the authenticated backend order API, so you need to sign in first.
        </p>
        <Link
          to="/login"
          className="inline-block rounded-lg bg-primary-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-700"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  if (order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="rounded-3xl bg-white p-10 text-center shadow-md">
          <ShoppingBag size={56} className="mx-auto text-primary-600" />
          <h1 className="mt-6 text-3xl font-bold text-gray-800">Order placed</h1>
          <p className="mt-3 text-gray-600">
            Order <span className="font-semibold text-gray-800">{order.orderNumber}</span> was created successfully.
          </p>
          <p className="mt-2 text-gray-600">
            Total charged: <span className="font-semibold text-gray-800">${order.totalAmount}</span>
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              to="/categories"
              className="rounded-lg bg-primary-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-primary-700"
            >
              Continue shopping
            </Link>
            <Link
              to="/"
              className="rounded-lg bg-gray-200 px-5 py-3 font-semibold text-gray-800 transition-colors hover:bg-gray-300"
            >
              Return home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Your cart is empty</h1>
        <p className="text-gray-600 mb-6">Add products before trying to check out.</p>
        <Link
          to="/categories"
          className="inline-block rounded-lg bg-primary-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-700"
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Checkout</h1>
        <p className="mt-2 text-gray-600">
          This form submits directly to the restored `/api/orders` endpoint.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={handleSubmit} className="lg:col-span-2 rounded-3xl bg-white p-8 shadow-md">
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-gray-700">Street Address</label>
              <input
                type="text"
                name="street_address"
                value={formData.street_address}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition-colors focus:border-primary-500"
                placeholder="123 Market Street"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition-colors focus:border-primary-500"
                placeholder="Beirut"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">State / Region</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition-colors focus:border-primary-500"
                placeholder="Mount Lebanon"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Postal Code</label>
              <input
                type="text"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition-colors focus:border-primary-500"
                placeholder="00000"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Country</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition-colors focus:border-primary-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-gray-700">Payment Method</label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition-colors focus:border-primary-500"
              >
                <option value="card">Card</option>
                <option value="cash">Cash on delivery</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-gray-700">Order Notes</label>
              <textarea
                name="notes"
                rows="4"
                value={formData.notes}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition-colors focus:border-primary-500"
                placeholder="Delivery instructions or other notes"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={`mt-8 w-full rounded-lg px-6 py-4 text-lg font-semibold text-white transition-colors ${
              submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700'
            }`}
          >
            {submitting ? 'Placing order...' : 'Place order'}
          </button>
        </form>

        <aside className="rounded-3xl bg-white p-8 shadow-md h-fit">
          <h2 className="text-xl font-semibold text-gray-800">Order Summary</h2>
          <div className="mt-6 space-y-3 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Items</span>
              <span>{totalItems}</span>
            </div>
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${Number(totalPrice || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span>${deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>${taxAmount.toFixed(2)}</span>
            </div>
          </div>
          <div className="mt-6 border-t pt-4">
            <div className="flex justify-between text-lg font-bold text-gray-800">
              <span>Total</span>
              <span>${grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Checkout;
