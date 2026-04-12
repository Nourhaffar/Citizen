const express = require('express');
const pool = require('../config/database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Apply auth and admin middleware to all admin routes
router.use(authMiddleware);
router.use(adminMiddleware);

// ===== PRODUCTS ADMIN =====

// Get all products (admin)
router.get('/admin/products', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const products = await pool.query(
      `SELECT p.*, c.name as category_name, s.name as supermarket_name 
       FROM products p 
       JOIN categories c ON p.category_id = c.id 
       JOIN supermarkets s ON p.supermarket_id = s.id 
       ORDER BY p.created_at DESC 
       LIMIT ? OFFSET ?`,
      [parseInt(limit), parseInt(offset)]
    );
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Create product
router.post('/admin/products', async (req, res) => {
  try {
    const { 
      supermarket_id, category_id, name, description, price, 
      original_price, image_url, stock_quantity, is_featured 
    } = req.body;

    if (!supermarket_id || !category_id || !name || !price) {
      return res.status(400).json({ error: 'Supermarket ID, category ID, name and price are required' });
    }

    const result = await pool.query(
      `INSERT INTO products (supermarket_id, category_id, name, description, price, original_price, image_url, stock_quantity, is_featured) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        supermarket_id, category_id, name, description || '', price, 
        original_price || price, image_url || '', stock_quantity || 0, is_featured || false
      ]
    );

    res.status(201).json({ 
      message: 'Product created successfully',
      productId: result.insertId 
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product
router.put('/admin/products/:id', async (req, res) => {
  try {
    const { 
      supermarket_id, category_id, name, description, price, 
      original_price, image_url, stock_quantity, is_featured, is_active 
    } = req.body;

    const result = await pool.query(
      `UPDATE products 
       SET supermarket_id = ?, category_id = ?, name = ?, description = ?, 
           price = ?, original_price = ?, image_url = ?, stock_quantity = ?, 
           is_featured = ?, is_active = ? 
       WHERE id = ?`,
      [
        supermarket_id, category_id, name, description, price, 
        original_price, image_url, stock_quantity, is_featured, is_active, req.params.id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product
router.delete('/admin/products/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// ===== CATEGORIES ADMIN =====

// Get all categories (admin)
router.get('/admin/categories', async (req, res) => {
  try {
    const categories = await pool.query('SELECT * FROM categories ORDER BY name');
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Create category
router.post('/admin/categories', async (req, res) => {
  try {
    const { name, description, image_url, parent_id } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const result = await pool.query(
      'INSERT INTO categories (name, description, image_url, parent_id) VALUES (?, ?, ?, ?)',
      [name, description || '', image_url || '', parent_id || null]
    );

    res.status(201).json({ 
      message: 'Category created successfully',
      categoryId: result.insertId 
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Update category
router.put('/admin/categories/:id', async (req, res) => {
  try {
    const { name, description, image_url, parent_id } = req.body;

    const result = await pool.query(
      'UPDATE categories SET name = ?, description = ?, image_url = ?, parent_id = ? WHERE id = ?',
      [name, description, image_url, parent_id, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ message: 'Category updated successfully' });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// Delete category
router.delete('/admin/categories/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM categories WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// ===== CUSTOMERS ADMIN =====

// Get all customers
router.get('/admin/customers', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const users = await pool.query(
      'SELECT id, email, first_name, last_name, phone, role, created_at FROM users WHERE role = "customer" ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [parseInt(limit), parseInt(offset)]
    );
    res.json(users);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// ===== ORDERS ADMIN =====

// Get all orders
router.get('/admin/orders', async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    
    let query = `
      SELECT o.*, u.email, u.first_name, u.last_name 
      FROM orders o 
      JOIN users u ON o.user_id = u.id 
    `;
    
    const params = [];
    
    if (status) {
      query += ' WHERE o.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY o.created_at DESC';
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const orders = await pool.query(query, params);
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Update order status
router.put('/admin/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = await pool.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ message: 'Order status updated successfully' });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// ===== SUPERMARKETS ADMIN =====

// Get all supermarkets (admin)
router.get('/admin/supermarkets', async (req, res) => {
  try {
    const supermarkets = await pool.query('SELECT * FROM supermarkets ORDER BY name');
    res.json(supermarkets);
  } catch (error) {
    console.error('Error fetching supermarkets:', error);
    res.status(500).json({ error: 'Failed to fetch supermarkets' });
  }
});

// Create supermarket
router.post('/admin/supermarkets', async (req, res) => {
  try {
    const { name, description, logo_url, address, phone, email } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Supermarket name is required' });
    }

    const result = await pool.query(
      'INSERT INTO supermarkets (name, description, logo_url, address, phone, email) VALUES (?, ?, ?, ?, ?, ?)',
      [name, description || '', logo_url || '', address || '', phone || '', email || '']
    );

    res.status(201).json({ 
      message: 'Supermarket created successfully',
      supermarketId: result.insertId 
    });
  } catch (error) {
    console.error('Error creating supermarket:', error);
    res.status(500).json({ error: 'Failed to create supermarket' });
  }
});

// Update supermarket
router.put('/admin/supermarkets/:id', async (req, res) => {
  try {
    const { name, description, logo_url, address, phone, email, is_active } = req.body;

    const result = await pool.query(
      'UPDATE supermarkets SET name = ?, description = ?, logo_url = ?, address = ?, phone = ?, email = ?, is_active = ? WHERE id = ?',
      [name, description, logo_url, address, phone, email, is_active, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Supermarket not found' });
    }

    res.json({ message: 'Supermarket updated successfully' });
  } catch (error) {
    console.error('Error updating supermarket:', error);
    res.status(500).json({ error: 'Failed to update supermarket' });
  }
});

module.exports = router;
