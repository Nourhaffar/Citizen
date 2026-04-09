import { createContext, useContext, useReducer, useEffect } from 'react';
import { cartService } from '../services';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CART':
      return { ...state, items: action.payload.items, loading: false };
    case 'ADD_ITEM':
      return { 
        ...state, 
        items: [...state.items, action.payload],
        totalItems: state.totalItems + action.payload.quantity 
      };
    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id ? action.payload : item
        ),
      };
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
        totalItems: state.totalItems - 1,
      };
    case 'CLEAR_CART':
      return { ...state, items: [], totalItems: 0 };
    case 'SET_LOADING':
      return { ...state, loading: true };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    totalItems: 0,
    totalPrice: 0,
    loading: false,
    error: null,
  });

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING' });
      const response = await cartService.getCart();
      dispatch({ 
        type: 'SET_CART', 
        payload: { items: response.data.items || [] } 
      });
      calculateTotals(response.data.items || []);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const calculateTotals = (items) => {
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    state.totalPrice = total;
    state.totalItems = count;
  };

  const addToCart = async (productId, quantity, supermarketId) => {
    try {
      const response = await cartService.addToCart(productId, quantity, supermarketId);
      dispatch({ type: 'ADD_ITEM', payload: response.data.item });
      return response.data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      const response = await cartService.updateQuantity(itemId, quantity);
      dispatch({ type: 'UPDATE_ITEM', payload: response.data.item });
      return response.data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const removeItem = async (itemId) => {
    try {
      await cartService.removeItem(itemId);
      dispatch({ type: 'REMOVE_ITEM', payload: itemId });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      await cartService.clearCart();
      dispatch({ type: 'CLEAR_CART' });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
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
