const mysql = require('mysql2/promise'); // 🎯 FIXED: Imports the native promise version directly

// Direct cloud connection stream optimized for serverless edge scaling
const pool = mysql.createPool({
  host: 'mysql-3a527387-thesis5.h.aivencloud.com',
  user: 'avnadmin',
  password: 'AVNS_BbFuXK9TNydOy0DlW2y', 
  database: 'defaultdb',
  port: 22574,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: { 
    rejectUnauthorized: false 
  }
});

// Export the pool directly
module.exports = pool;