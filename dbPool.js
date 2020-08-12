const mysql = require("mysql");
require("dotenv").config();

// It is best practice to create a pool of connections to a database
const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

// This allows us to be able to import our pool to app.js
module.exports = pool;
