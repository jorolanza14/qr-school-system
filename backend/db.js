const mysql = require('mysql2');
require('dotenv').config();

// Create a connection pool to automatically manage multiple incoming queries
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // Kept blank to match your XAMPP default config
  database: 'qr_school_system',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Export the pool to use it across our endpoint modules using clean promises
module.exports = pool.promise();