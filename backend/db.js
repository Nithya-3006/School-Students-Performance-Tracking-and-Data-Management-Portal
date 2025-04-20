// db.js
const mysql = require("mysql2/promise");

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root", 
  database: "meta_school" 
});

db.getConnection()
  .then((connection) => {
    console.log("Connected to database");
    connection.release();
  })
  .catch((error) => {
    console.error("Error connecting to database:", error);
  });

module.exports = db;