const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'mysql-3a527387-thesis5.h.aivencloud.com',
  user: 'avnadmin',
  password: 'AVNS_BbFuXK9TNydOy0DlW2y', 
  database: 'defaultdb', // 🎯 FIXED: Changed from 'defaultdb' to your actual schema name
  port: 22574,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: { 
    rejectUnauthorized: false 
  }
});

module.exports = pool;