import api from './api';

export const productService = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  getByCategory: (categoryId) => api.get(`/products/category/${categoryId}`),
  getFeatured: () => api.get('/products/featured'),
  getBestSelling: () => api.get('/products/bestselling'),
  search: (query) => api.get(`/products/search?q=${query}`),
};

export const categoryService = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
};

export const supermarketService = {
  getAll: () => api.get('/supermarkets'),
  getById: (id) => api.get(`/supermarkets/${id}`),
};

export const cartService = {
  getCart: () => api.get('/cart'),
  addToCart: (productId, quantity = 1, supermarketId) => 
    api.post('/cart/items', { productId, quantity, supermarketId }),
  updateQuantity: (itemId, quantity) => 
    api.put(`/cart/items/${itemId}`, { quantity }),
  removeItem: (itemId) => api.delete(`/cart/items/${itemId}`),
  clearCart: () => api.delete('/cart'),
};

export const orderService = {
  create: (orderData) => api.post('/orders', orderData),
  getAll: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  getUserOrders: () => api.get('/orders/user'),
};

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
};

export const userService = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
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
