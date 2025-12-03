const { pool } = require("../config/db");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

class User {
  static async create(username, password) {
    const id = uuidv4();
    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      "INSERT INTO users (id, username, password) VALUES (?, ?, ?)",
      [id, username, passwordHash]
    );

    return { id, username };
  }

  static async findByUsername(username) {
    const [rows] = await pool.execute(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await pool.execute("SELECT * FROM users WHERE id = ?", [id]);
    return rows[0];
  }

  static async validatePassword(username, password) {
    const user = await this.findByUsername(username);

    if (!user) {
      return false;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    return isMatch ? user : null;
  }

  static async getAllUsers() {
    const [rows] = await pool.execute("SELECT id, username FROM users");
    return rows;
  }

  static async deleteById(id) {
    const [result] = await pool.execute("DELETE FROM users WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }

  static async updatePassword(id, newPasswordHash) {
    const [result] = await pool.execute(
      "UPDATE users SET password = ? WHERE id = ?",
      [newPasswordHash, id]
    );
    return result.affectedRows > 0;
  }

  static async updateUsername(id, newUsername) {
    const [result] = await pool.execute(
      "UPDATE users SET username = ? WHERE id = ?",
      [newUsername, id]
    );
    return result.affectedRows > 0;
  }

  static async userExists(username) {
    const [rows] = await pool.execute(
      "SELECT 1 FROM users WHERE username = ? LIMIT 1",
      [username]
    );
    return rows.length > 0;
  }

  static async isUserOnline(id) {
    const [rows] = await pool.execute(
      "SELECT is_online FROM users WHERE id = ?",
      [id]
    );
    return rows.length > 0 ? rows[0].is_online : null;
  } 
}

module.exports = User;
