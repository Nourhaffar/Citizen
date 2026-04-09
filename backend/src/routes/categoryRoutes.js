const express = require('express');
const pool = require('../config/database');

const router = express.Router();

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await pool.query('SELECT * FROM categories ORDER BY name');
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get single category with products
router.get('/:id/products', async (req, res) => {
  try {
    const { limit = 20, offset = 0, sort = 'name', order = 'ASC' } = req.query;
    
    const validSorts = ['name', 'price', 'created_at'];
    const sortBy = validSorts.includes(sort) ? sort : 'name';
    const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    
    const products = await pool.query(
      `SELECT p.*, c.name as category_name, s.name as supermarket_name 
       FROM products p 
       JOIN categories c ON p.category_id = c.id 
       JOIN supermarkets s ON p.supermarket_id = s.id 
       WHERE p.category_id = ? AND p.is_active = TRUE 
       ORDER BY p.${sortBy} ${sortOrder}
       LIMIT ? OFFSET ?`,
      [req.params.id, parseInt(limit), parseInt(offset)]
    );
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

module.exports = router;
