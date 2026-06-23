const mysql = require('mysql2');

// Force direct cloud connection strings to bypass any broken dashboard secrets or local .env files
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

// Export the pool to use it across our endpoint modules using clean promises
module.exports = pool.promise();