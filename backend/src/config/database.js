require('dotenv').config();

const mariadb = require('mariadb');

const pool = mariadb.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'citizen_db',
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000,
  idleTimeout: 600000,
});

module.exports = pool;
