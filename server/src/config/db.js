const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
dotenv.config();
const logger = require("../helpers/logger");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function testDbConnection() {
  let connection;
  try {
    connection = await pool.getConnection();
    logger.info("MySQL connection pool established successfully");
  } catch (error) {
    logger.error("MySQL connection failed");
    throw error;
  } finally {
    if (connection) connection.release();
  }
}

module.exports = { pool, testDbConnection };
