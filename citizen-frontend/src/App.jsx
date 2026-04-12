import { Route, Routes } from 'react-router-dom';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Categories from './pages/Categories';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Supermarkets from './pages/Supermarkets';
import SupermarketDetails from './pages/SupermarketDetails';
import StaticPage from './pages/StaticPage';
import NotFound from './pages/NotFound';

function App() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/supermarkets" element={<Supermarkets />} />
          <Route path="/supermarkets/:id" element={<SupermarketDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route
            path="/admin"
            element={
              <StaticPage
                title="Admin Dashboard"
                description="The backend admin APIs are restored. This route is a placeholder until the dedicated admin UI is rebuilt."
              />
            }
          />
          <Route
            path="/contact"
            element={
              <StaticPage
                title="Contact Citizen"
                description="Customer support content is still being restored. For now, use the backend APIs and seed data verified in this repair."
              />
            }
          />
          <Route
            path="/faq"
            element={
              <StaticPage
                title="Frequently Asked Questions"
                description="The storefront is back online. This informational page is a temporary placeholder while the final content is restored."
              />
            }
          />
          <Route
            path="/shipping"
            element={
              <StaticPage
                title="Shipping Information"
                description="Citizen currently calculates a fixed delivery fee and tax in checkout. This page is reserved for the full shipping policy."
              />
            }
          />
          <Route
            path="/returns"
            element={
              <StaticPage
                title="Returns and Refunds"
                description="The return policy content has not been rewritten yet. The route remains active so the restored frontend has no broken navigation."
              />
            }
          />
          <Route
            path="/privacy"
            element={
              <StaticPage
                title="Privacy Policy"
                description="This route is restored as a placeholder while the production policy text is added."
              />
            }
          />
          <Route
            path="/terms"
            element={
              <StaticPage
                title="Terms of Service"
                description="This route is restored as a placeholder while the production terms are added."
              />
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
