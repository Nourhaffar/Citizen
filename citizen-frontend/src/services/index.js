import api from './api';

export const productService = {
  getAll: (params = {}) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getFeatured: (params = {}) => api.get('/products/featured', { params }),
  getBestSelling: (params = {}) => api.get('/products/best-selling', { params }),
  getRecommended: (userId, params = {}) =>
    api.get(userId ? `/products/recommended/${userId}` : '/products/recommended', { params }),
};

export const categoryService = {
  getAll: () => api.get('/categories'),
  getProducts: (id, params = {}) => api.get(`/categories/${id}/products`, { params }),
};

export const supermarketService = {
  getAll: () => api.get('/supermarkets'),
  getById: (id) => api.get(`/supermarkets/${id}`),
  getProducts: (id, params = {}) => api.get(`/supermarkets/${id}/products`, { params }),
};

export const cartService = {
  getCart: () => api.get('/cart'),
  addToCart: (productId, quantity = 1) => api.post('/cart/add', { productId, quantity }),
  updateQuantity: (itemId, quantity) => api.put(`/cart/update/${itemId}`, { quantity }),
  removeItem: (itemId) => api.delete(`/cart/remove/${itemId}`),
  clearCart: () => api.delete('/cart/clear'),
};

export const orderService = {
  create: (orderData) => api.post('/orders', orderData),
  getUserOrders: () => api.get('/orders/my-orders'),
  getById: (id) => api.get(`/orders/${id}`),
};

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/profile'),
};

export const adminService = {
  // Products
  createProduct: (data) => api.post('/admin/products', data),
  updateProduct: (id, data) => api.put(`/admin/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
  
  // Categories
  createCategory: (data) => api.post('/admin/categories', data),
  updateCategory: (id, data) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),
  
  // Supermarkets
  createSupermarket: (data) => api.post('/admin/supermarkets', data),
  updateSupermarket: (id, data) => api.put(`/admin/supermarkets/${id}`, data),
  deleteSupermarket: (id) => api.delete(`/admin/supermarkets/${id}`),
  
  // Orders
  updateOrderStatus: (id, status) => api.put(`/admin/orders/${id}/status`, { status }),
};
