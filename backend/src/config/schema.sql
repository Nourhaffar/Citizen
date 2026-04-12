-- Citizen Database Schema
-- Multi-supermarket integration platform

CREATE DATABASE IF NOT EXISTS citizen_db;
USE citizen_db;

-- Supermarkets table
CREATE TABLE IF NOT EXISTS supermarkets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    logo_url VARCHAR(500),
    address VARCHAR(500),
    phone VARCHAR(20),
    email VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    parent_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Users table (customers and admins)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    role ENUM('customer', 'admin') DEFAULT 'customer',
    preferences JSON, -- Store user preferences for recommendations
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    supermarket_id INT NOT NULL,
    category_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2),
    image_url VARCHAR(500),
    stock_quantity INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (supermarket_id) REFERENCES supermarkets(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    INDEX idx_category (category_id),
    INDEX idx_supermarket (supermarket_id),
    INDEX idx_price (price),
    INDEX idx_featured (is_featured)
);

-- Addresses table
CREATE TABLE IF NOT EXISTS addresses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    street_address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'USA',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    subtotal DECIMAL(10, 2) NOT NULL,
    delivery_fee DECIMAL(10, 2) DEFAULT 0.00,
    tax_amount DECIMAL(10, 2) DEFAULT 0.00,
    total_amount DECIMAL(10, 2) NOT NULL,
    delivery_address_id INT,
    payment_method VARCHAR(50),
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (delivery_address_id) REFERENCES addresses(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_order_number (order_number)
);

-- Order Items table
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    supermarket_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    FOREIGN KEY (supermarket_id) REFERENCES supermarkets(id) ON DELETE RESTRICT,
    INDEX idx_order (order_id),
    INDEX idx_product (product_id)
);

-- Cart table (for persistent cart storage)
CREATE TABLE IF NOT EXISTS cart_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_product (user_id, product_id)
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_product_review (user_id, product_id)
);

-- Insert sample data
INSERT INTO supermarkets (name, description, address, phone, email)
SELECT 'Fresh Mart', 'Your neighborhood fresh grocery store', '123 Main St, Cityville', '555-0101', 'contact@freshmart.com'
WHERE NOT EXISTS (SELECT 1 FROM supermarkets WHERE name = 'Fresh Mart');

INSERT INTO supermarkets (name, description, address, phone, email)
SELECT 'Green Valley', 'Organic and natural products', '456 Oak Ave, Townburg', '555-0102', 'info@greenvalley.com'
WHERE NOT EXISTS (SELECT 1 FROM supermarkets WHERE name = 'Green Valley');

INSERT INTO supermarkets (name, description, address, phone, email)
SELECT 'Super Save', 'Discount prices on everyday items', '789 Pine Rd, Villagetown', '555-0103', 'support@supersave.com'
WHERE NOT EXISTS (SELECT 1 FROM supermarkets WHERE name = 'Super Save');

INSERT INTO categories (name, description)
SELECT 'Fruits & Vegetables', 'Fresh produce'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Fruits & Vegetables');

INSERT INTO categories (name, description)
SELECT 'Dairy & Eggs', 'Milk, cheese, eggs and more'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Dairy & Eggs');

INSERT INTO categories (name, description)
SELECT 'Meat & Seafood', 'Fresh meat and seafood'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Meat & Seafood');

INSERT INTO categories (name, description)
SELECT 'Bakery', 'Fresh bread and baked goods'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Bakery');

INSERT INTO categories (name, description)
SELECT 'Beverages', 'Drinks and beverages'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Beverages');

INSERT INTO categories (name, description)
SELECT 'Snacks', 'Chips, cookies and snacks'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Snacks');

INSERT INTO categories (name, description)
SELECT 'Household', 'Cleaning and household items'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Household');

INSERT INTO categories (name, description)
SELECT 'Personal Care', 'Health and beauty products'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Personal Care');

-- Sample admin user (password: admin123)
INSERT INTO users (email, password_hash, first_name, last_name, role)
SELECT 'admin@citizen.com', '$2b$10$5wolIApV1kRNZcf76Xx/D.S.cFI22hARqOVpBy/jubieYYzlg119e', 'Admin', 'User', 'admin'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@citizen.com');

-- Sample products so the storefront renders useful content after initialization
INSERT INTO products (supermarket_id, category_id, name, description, price, original_price, image_url, stock_quantity, is_featured)
SELECT s.id, c.id, 'Organic Bananas', 'Sweet organic bananas sold by the bunch.', 1.99, 2.49, '', 120, TRUE
FROM supermarkets s
JOIN categories c ON c.name = 'Fruits & Vegetables'
WHERE s.name = 'Fresh Mart'
  AND NOT EXISTS (
    SELECT 1 FROM products p WHERE p.name = 'Organic Bananas' AND p.supermarket_id = s.id
  );

INSERT INTO products (supermarket_id, category_id, name, description, price, original_price, image_url, stock_quantity, is_featured)
SELECT s.id, c.id, 'Family Pack Milk', 'Fresh whole milk for everyday breakfast and cooking.', 3.49, 3.99, '', 80, TRUE
FROM supermarkets s
JOIN categories c ON c.name = 'Dairy & Eggs'
WHERE s.name = 'Fresh Mart'
  AND NOT EXISTS (
    SELECT 1 FROM products p WHERE p.name = 'Family Pack Milk' AND p.supermarket_id = s.id
  );

INSERT INTO products (supermarket_id, category_id, name, description, price, original_price, image_url, stock_quantity, is_featured)
SELECT s.id, c.id, 'Free Range Eggs', 'A dozen free-range eggs with rich flavor.', 4.79, 5.29, '', 60, FALSE
FROM supermarkets s
JOIN categories c ON c.name = 'Dairy & Eggs'
WHERE s.name = 'Green Valley'
  AND NOT EXISTS (
    SELECT 1 FROM products p WHERE p.name = 'Free Range Eggs' AND p.supermarket_id = s.id
  );

INSERT INTO products (supermarket_id, category_id, name, description, price, original_price, image_url, stock_quantity, is_featured)
SELECT s.id, c.id, 'Sourdough Bread', 'Freshly baked sourdough loaf with a crisp crust.', 4.25, 4.95, '', 45, TRUE
FROM supermarkets s
JOIN categories c ON c.name = 'Bakery'
WHERE s.name = 'Green Valley'
  AND NOT EXISTS (
    SELECT 1 FROM products p WHERE p.name = 'Sourdough Bread' AND p.supermarket_id = s.id
  );

INSERT INTO products (supermarket_id, category_id, name, description, price, original_price, image_url, stock_quantity, is_featured)
SELECT s.id, c.id, 'Sparkling Water 6-Pack', 'Refreshing sparkling water with zero sugar.', 5.99, 6.99, '', 90, FALSE
FROM supermarkets s
JOIN categories c ON c.name = 'Beverages'
WHERE s.name = 'Super Save'
  AND NOT EXISTS (
    SELECT 1 FROM products p WHERE p.name = 'Sparkling Water 6-Pack' AND p.supermarket_id = s.id
  );

INSERT INTO products (supermarket_id, category_id, name, description, price, original_price, image_url, stock_quantity, is_featured)
SELECT s.id, c.id, 'Crunchy Granola Bars', 'A snack box packed with oats, nuts, and dried fruit.', 6.49, 7.19, '', 75, TRUE
FROM supermarkets s
JOIN categories c ON c.name = 'Snacks'
WHERE s.name = 'Super Save'
  AND NOT EXISTS (
    SELECT 1 FROM products p WHERE p.name = 'Crunchy Granola Bars' AND p.supermarket_id = s.id
  );

INSERT INTO products (supermarket_id, category_id, name, description, price, original_price, image_url, stock_quantity, is_featured)
SELECT s.id, c.id, 'Chicken Breast Fillets', 'Lean boneless chicken breast fillets for quick meals.', 9.99, 11.49, '', 50, FALSE
FROM supermarkets s
JOIN categories c ON c.name = 'Meat & Seafood'
WHERE s.name = 'Fresh Mart'
  AND NOT EXISTS (
    SELECT 1 FROM products p WHERE p.name = 'Chicken Breast Fillets' AND p.supermarket_id = s.id
  );

INSERT INTO products (supermarket_id, category_id, name, description, price, original_price, image_url, stock_quantity, is_featured)
SELECT s.id, c.id, 'Laundry Detergent', 'Concentrated liquid detergent for up to 40 washes.', 12.99, 14.99, '', 35, FALSE
FROM supermarkets s
JOIN categories c ON c.name = 'Household'
WHERE s.name = 'Super Save'
  AND NOT EXISTS (
    SELECT 1 FROM products p WHERE p.name = 'Laundry Detergent' AND p.supermarket_id = s.id
  );
