const express = require('express');
const pool = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Generate unique order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${timestamp}-${random}`;
};

// Create new order (checkout)
router.post('/', authMiddleware, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { deliveryAddress, paymentMethod, notes } = req.body;

    if (!deliveryAddress || !deliveryAddress.street_address || !deliveryAddress.city) {
      await connection.rollback();
      return res.status(400).json({ error: 'Delivery address is required' });
    }

    // Get cart items
    const cartItems = await connection.query(
      `SELECT ci.*, p.price, p.supermarket_id 
       FROM cart_items ci 
       JOIN products p ON ci.product_id = p.id 
       WHERE ci.user_id = ?`,
      [req.user.id]
    );

    if (cartItems.length === 0) {
      await connection.rollback();
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Calculate totals
    let subtotal = 0;
    cartItems.forEach(item => {
      subtotal += parseFloat(item.price) * parseInt(item.quantity);
    });

    const deliveryFee = 5.99; // Fixed delivery fee for MVP
    const taxAmount = subtotal * 0.08; // 8% tax
    const totalAmount = subtotal + deliveryFee + taxAmount;

    // Create or get delivery address
    let addressId;
    const existingAddresses = await connection.query(
      'SELECT id FROM addresses WHERE user_id = ? AND street_address = ? AND city = ?',
      [req.user.id, deliveryAddress.street_address, deliveryAddress.city]
    );

    if (existingAddresses.length > 0) {
      addressId = existingAddresses[0].id;
    } else {
      const addressResult = await connection.query(
        `INSERT INTO addresses (user_id, street_address, city, state, postal_code, country) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          req.user.id,
          deliveryAddress.street_address,
          deliveryAddress.city,
          deliveryAddress.state || '',
          deliveryAddress.postal_code || '',
          deliveryAddress.country || 'USA'
        ]
      );
      addressId = addressResult.insertId;
    }

    // Create order
    const orderNumber = generateOrderNumber();
    const orderResult = await connection.query(
      `INSERT INTO orders (user_id, order_number, subtotal, delivery_fee, tax_amount, total_amount, delivery_address_id, payment_method, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        orderNumber,
        subtotal.toFixed(2),
        deliveryFee.toFixed(2),
        taxAmount.toFixed(2),
        totalAmount.toFixed(2),
        addressId,
        paymentMethod || 'card',
        notes || ''
      ]
    );

    const orderId = orderResult.insertId;

    // Create order items
    for (const item of cartItems) {
      const itemSubtotal = parseFloat(item.price) * parseInt(item.quantity);
      await connection.query(
        `INSERT INTO order_items (order_id, product_id, supermarket_id, quantity, unit_price, subtotal) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [orderId, item.product_id, item.supermarket_id, item.quantity, item.price, itemSubtotal.toFixed(2)]
      );

      // Update product stock
      await connection.query(
        'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
        [item.quantity, item.product_id]
      );
    }

    // Clear cart
    await connection.query('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);

    await connection.commit();

    res.status(201).json({
      message: 'Order placed successfully',
      order: {
        id: orderId,
        orderNumber,
        totalAmount: totalAmount.toFixed(2),
        status: 'pending'
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  } finally {
    connection.release();
  }
});

// Get user's orders
router.get('/my-orders', authMiddleware, async (req, res) => {
  try {
    const orders = await pool.query(
      `SELECT o.*, a.street_address, a.city, a.state, a.postal_code 
       FROM orders o 
       LEFT JOIN addresses a ON o.delivery_address_id = a.id 
       WHERE o.user_id = ? 
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );

    // Get order items for each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await pool.query(
          `SELECT oi.*, p.name, p.image_url, s.name as supermarket_name 
           FROM order_items oi 
           JOIN products p ON oi.product_id = p.id 
           JOIN supermarkets s ON oi.supermarket_id = s.id 
           WHERE oi.order_id = ?`,
          [order.id]
        );

        return {
          ...order,
          items
        };
      })
    );

    res.json(ordersWithItems);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get single order details
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const orders = await pool.query(
      `SELECT o.*, a.street_address, a.city, a.state, a.postal_code 
       FROM orders o 
       LEFT JOIN addresses a ON o.delivery_address_id = a.id 
       WHERE o.id = ? AND o.user_id = ?`,
      [req.params.id, req.user.id]
    );

    if (orders.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orders[0];
    const items = await pool.query(
      `SELECT oi.*, p.name, p.image_url, s.name as supermarket_name 
       FROM order_items oi 
       JOIN products p ON oi.product_id = p.id 
       JOIN supermarkets s ON oi.supermarket_id = s.id 
       WHERE oi.order_id = ?`,
      [order.id]
    );

    res.json({ ...order, items });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

module.exports = router;
