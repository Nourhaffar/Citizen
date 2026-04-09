const express = require('express');
const pool = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get cart items for current user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const items = await pool.query(
      `SELECT ci.*, p.name, p.price, p.image_url, s.name as supermarket_name 
       FROM cart_items ci 
       JOIN products p ON ci.product_id = p.id 
       JOIN supermarkets s ON p.supermarket_id = s.id 
       WHERE ci.user_id = ?`,
      [req.user.id]
    );

    // Group by supermarket for multi-vendor display
    const groupedBySupermarket = {};
    let totalAmount = 0;

    items.forEach(item => {
      const itemTotal = parseFloat(item.price) * parseInt(item.quantity);
      totalAmount += itemTotal;

      if (!groupedBySupermarket[item.supermarket_name]) {
        groupedBySupermarket[item.supermarket_name] = {
          supermarket: item.supermarket_name,
          items: [],
          subtotal: 0
        };
      }

      groupedBySupermarket[item.supermarket_name].items.push({
        id: item.id,
        productId: item.product_id,
        name: item.name,
        price: parseFloat(item.price),
        quantity: parseInt(item.quantity),
        image_url: item.image_url,
        itemTotal
      });

      groupedBySupermarket[item.supermarket_name].subtotal += itemTotal;
    });

    res.json({
      items: Object.values(groupedBySupermarket),
      totalAmount: parseFloat(totalAmount.toFixed(2))
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// Add item to cart
router.post('/add', authMiddleware, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    // Check if product exists and is active
    const products = await pool.query('SELECT id, price, stock_quantity FROM products WHERE id = ? AND is_active = TRUE', [productId]);
    if (products.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = products[0];
    
    if (quantity > product.stock_quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    // Check if item already in cart
    const existingItems = await pool.query(
      'SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?',
      [req.user.id, productId]
    );

    if (existingItems.length > 0) {
      // Update quantity
      const newQuantity = parseInt(existingItems[0].quantity) + parseInt(quantity);
      await pool.query(
        'UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?',
        [newQuantity, req.user.id, productId]
      );
    } else {
      // Add new item
      await pool.query(
        'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)',
        [req.user.id, productId, quantity]
      );
    }

    res.json({ message: 'Item added to cart successfully' });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

// Update cart item quantity
router.put('/update/:itemId', authMiddleware, async (req, res) => {
  try {
    const { quantity } = req.body;

    if (!quantity || quantity < 0) {
      return res.status(400).json({ error: 'Invalid quantity' });
    }

    const result = await pool.query(
      'UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?',
      [quantity, req.params.itemId, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.json({ message: 'Cart updated successfully' });
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ error: 'Failed to update cart' });
  }
});

// Remove item from cart
router.delete('/remove/:itemId', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM cart_items WHERE id = ? AND user_id = ?',
      [req.params.itemId, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.json({ message: 'Item removed from cart successfully' });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ error: 'Failed to remove item from cart' });
  }
});

// Clear cart
router.delete('/clear', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);
    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

module.exports = router;
