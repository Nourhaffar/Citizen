const express = require('express');
const pool = require('../config/database');

const router = express.Router();

// Get all supermarkets
router.get('/', async (req, res) => {
  try {
    const supermarkets = await pool.query(
      'SELECT * FROM supermarkets WHERE is_active = TRUE ORDER BY name'
    );
    res.json(supermarkets);
  } catch (error) {
    console.error('Error fetching supermarkets:', error);
    res.status(500).json({ error: 'Failed to fetch supermarkets' });
  }
});

// Get single supermarket
router.get('/:id', async (req, res) => {
  try {
    const supermarkets = await pool.query('SELECT * FROM supermarkets WHERE id = ?', [req.params.id]);
    if (supermarkets.length === 0) {
      return res.status(404).json({ error: 'Supermarket not found' });
    }
    res.json(supermarkets[0]);
  } catch (error) {
    console.error('Error fetching supermarket:', error);
    res.status(500).json({ error: 'Failed to fetch supermarket' });
  }
});

// Get products by supermarket
router.get('/:id/products', async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const products = await pool.query(
      `SELECT p.*, c.name as category_name, s.name as supermarket_name 
       FROM products p 
       JOIN categories c ON p.category_id = c.id 
       JOIN supermarkets s ON p.supermarket_id = s.id 
       WHERE p.supermarket_id = ? AND p.is_active = TRUE 
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
