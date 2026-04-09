const express = require('express');
const pool = require('../config/database');

const router = express.Router();

// Get all products with filtering and sorting
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      supermarket, 
      minPrice, 
      maxPrice, 
      search, 
      sort = 'name', 
      order = 'ASC',
      limit = 20, 
      offset = 0 
    } = req.query;

    let query = `
      SELECT p.*, c.name as category_name, s.name as supermarket_name 
      FROM products p 
      JOIN categories c ON p.category_id = c.id 
      JOIN supermarkets s ON p.supermarket_id = s.id 
      WHERE p.is_active = TRUE
    `;
    const params = [];

    if (category) {
      query += ' AND p.category_id = ?';
      params.push(category);
    }

    if (supermarket) {
      query += ' AND p.supermarket_id = ?';
      params.push(supermarket);
    }

    if (minPrice) {
      query += ' AND p.price >= ?';
      params.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      query += ' AND p.price <= ?';
      params.push(parseFloat(maxPrice));
    }

    if (search) {
      query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    const validSorts = ['name', 'price', 'created_at', 'stock_quantity'];
    const sortBy = validSorts.includes(sort) ? sort : 'name';
    const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    query += ` ORDER BY p.${sortBy} ${sortOrder} LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const products = await pool.query(query, params);
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get featured products
router.get('/featured', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const products = await pool.query(
      `SELECT p.*, c.name as category_name, s.name as supermarket_name 
       FROM products p 
       JOIN categories c ON p.category_id = c.id 
       JOIN supermarkets s ON p.supermarket_id = s.id 
       WHERE p.is_featured = TRUE AND p.is_active = TRUE 
       ORDER BY p.created_at DESC 
       LIMIT ?`,
      [parseInt(limit)]
    );
    res.json(products);
  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.status(500).json({ error: 'Failed to fetch featured products' });
  }
});

// Get best selling products
router.get('/best-selling', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const products = await pool.query(
      `SELECT p.*, c.name as category_name, s.name as supermarket_name, 
              COALESCE(SUM(oi.quantity), 0) as total_sold
       FROM products p 
       JOIN categories c ON p.category_id = c.id 
       JOIN supermarkets s ON p.supermarket_id = s.id 
       LEFT JOIN order_items oi ON p.id = oi.product_id 
       WHERE p.is_active = TRUE 
       GROUP BY p.id 
       ORDER BY total_sold DESC 
       LIMIT ?`,
      [parseInt(limit)]
    );
    res.json(products);
  } catch (error) {
    console.error('Error fetching best selling products:', error);
    res.status(500).json({ error: 'Failed to fetch best selling products' });
  }
});

// Get recommended products (based on category preferences or random for new users)
router.get('/recommended/:userId?', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10 } = req.query;

    let products;
    
    if (userId) {
      // Get user's preferred categories from their order history
      products = await pool.query(
        `SELECT p.*, c.name as category_name, s.name as supermarket_name 
         FROM products p 
         JOIN categories c ON p.category_id = c.id 
         JOIN supermarkets s ON p.supermarket_id = s.id 
         WHERE p.is_active = TRUE 
           AND p.category_id IN (
             SELECT p2.category_id 
             FROM order_items oi2 
             JOIN products p2 ON oi2.product_id = p2.id 
             JOIN orders o ON oi2.order_id = o.id 
             WHERE o.user_id = ? 
             GROUP BY p2.category_id 
             ORDER BY COUNT(*) DESC 
             LIMIT 3
           )
         ORDER BY RAND() 
         LIMIT ?`,
        [userId, parseInt(limit)]
      );

      // If no recommendations based on history, return random products
      if (products.length === 0) {
        products = await pool.query(
          `SELECT p.*, c.name as category_name, s.name as supermarket_name 
           FROM products p 
           JOIN categories c ON p.category_id = c.id 
           JOIN supermarkets s ON p.supermarket_id = s.id 
           WHERE p.is_active = TRUE 
           ORDER BY RAND() 
           LIMIT ?`,
          [parseInt(limit)]
        );
      }
    } else {
      // Return random featured products for non-authenticated users
      products = await pool.query(
        `SELECT p.*, c.name as category_name, s.name as supermarket_name 
         FROM products p 
         JOIN categories c ON p.category_id = c.id 
         JOIN supermarkets s ON p.supermarket_id = s.id 
         WHERE p.is_active = TRUE 
         ORDER BY RAND() 
         LIMIT ?`,
        [parseInt(limit)]
      );
    }

    res.json(products);
  } catch (error) {
    console.error('Error fetching recommended products:', error);
    res.status(500).json({ error: 'Failed to fetch recommended products' });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const products = await pool.query(
      `SELECT p.*, c.name as category_name, s.name as supermarket_name 
       FROM products p 
       JOIN categories c ON p.category_id = c.id 
       JOIN supermarkets s ON p.supermarket_id = s.id 
       WHERE p.id = ?`,
      [req.params.id]
    );

    if (products.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(products[0]);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

module.exports = router;
