import { createContext, useContext, useEffect, useReducer } from 'react';
import { cartService } from '../services';
import { useAuth } from './AuthContext';

const CartContext = createContext();

const initialState = {
  groups: [],
  items: [],
  totalItems: 0,
  totalPrice: 0,
  loading: false,
  error: null,
};

const flattenGroups = (groups = []) =>
  groups.flatMap((group) =>
    (group.items || []).map((item) => ({
      ...item,
      supermarket_name: group.supermarket,
      supermarket_subtotal: group.subtotal,
    }))
  );

const buildCartState = (groups = []) => {
  const items = flattenGroups(groups);
  const totalItems = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + Number(item.itemTotal ?? Number(item.price || 0) * Number(item.quantity || 0)),
    0
  );

  return {
    groups,
    items,
    totalItems,
    totalPrice: Number(totalPrice.toFixed(2)),
  };
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CART':
      return {
        ...state,
        ...buildCartState(action.payload),
        loading: false,
        error: null,
      };
    case 'SET_LOADING':
      return { ...state, loading: true, error: null };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'RESET_CART':
      return { ...initialState };
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [state, dispatch] = useReducer(cartReducer, initialState);

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated]);

  const fetchCart = async () => {
    if (!localStorage.getItem('token')) {
      dispatch({ type: 'RESET_CART' });
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING' });
      const response = await cartService.getCart();
      dispatch({
        type: 'SET_CART',
        payload: response.data.items || [],
      });
    } catch (error) {
      if (error.response?.status === 401) {
        dispatch({ type: 'RESET_CART' });
        return;
      }

      dispatch({
        type: 'SET_ERROR',
        payload: error.response?.data?.error || error.message || 'Failed to fetch cart',
      });
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    if (!localStorage.getItem('token')) {
      throw new Error('Please log in to manage your cart.');
    }

    try {
      await cartService.addToCart(productId, quantity);
      await fetchCart();
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error.response?.data?.error || error.message || 'Failed to add item to cart',
      });
      throw error;
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      await cartService.updateQuantity(itemId, quantity);
      await fetchCart();
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error.response?.data?.error || error.message || 'Failed to update cart item',
      });
      throw error;
    }
  };

  const removeItem = async (itemId) => {
    try {
      await cartService.removeItem(itemId);
      await fetchCart();
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error.response?.data?.error || error.message || 'Failed to remove cart item',
      });
      throw error;
    }
  };

  const clearCart = async () => {
    if (!localStorage.getItem('token')) {
      dispatch({ type: 'RESET_CART' });
      return;
    }

    try {
      await cartService.clearCart();
      await fetchCart();
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error.response?.data?.error || error.message || 'Failed to clear cart',
      });
      throw error;
    }
  };

  return (
    <CartContext.Provider value={{
      ...state,
      addToCart,
      updateQuantity,
      removeItem,
      clearCart,
      fetchCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
