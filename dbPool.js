const mysql = require('mysql');

// It is best practice to create a pool of connections to a database
const pool = mysql.createPool({ 
    connectionLimit: 10,
    host: "mkorvuw3sl6cu9ms.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
    user: "xsm6b0vnx5zpiok0", 
    password: "n2xqlw0euaxhxgl7", 
    database: "xe76e978ta7tixyp"
});

// This allows us to be able to import our pool to app.js
module.exports = pool;