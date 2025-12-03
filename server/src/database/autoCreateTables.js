const { pool } = require("../config/db");
const logger = require("../helpers/logger");

async function autoCreateTables() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id CHAR(36) PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        is_online BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        message_id CHAR(36) PRIMARY KEY,
        sender_id CHAR(36) NOT NULL,
        receiver_id CHAR(36) NOT NULL,
        content TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES users(id)
            ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (receiver_id) REFERENCES users(id)
            ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    logger.info("Database tables verified/created.");
  } catch (err) {
    logger.error("Table creation failed:", err);
    throw err;
  }
}

module.exports = { autoCreateTables };
