const { pool } = require("../config/db");
const { v4: uuidv4 } = require("uuid");

class Message {
  static async create(senderId, receiverId, content) {
    const id = uuidv4();

    await pool.execute(
      `INSERT INTO messages (message_id, sender_id, receiver_id, content) VALUES (?, ?, ?, ?)`,
      [id, senderId, receiverId, content]
    );

    return {
      message_id: id,
      sender_id: senderId,
      receiver_id: receiverId,
      content,
      status: "sent",
      timestamp: new Date(),
    };
  }

  static async updateStatus(messageId, status) {
    await pool.execute(`UPDATE messages SET status = ? WHERE message_id = ?`, [
      status,
      messageId,
    ]);
  }

  static async getConversation(user1, user2) {
    const [rows] = await pool.execute(
      `SELECT * FROM messages 
       WHERE (sender_id = ? AND receiver_id = ?) 
          OR (sender_id = ? AND receiver_id = ?)
       ORDER BY timestamp ASC`,
      [user1, user2, user2, user1]
    );

    return rows;
  }

  static async getById(messageId) {
    const [rows] = await pool.execute(
      "SELECT * FROM messages WHERE message_id = ?",
      [messageId]
    );
    return rows[0] || null;
  }

  static async getDashboardSummary(userId) {
    // This SQL query is complex as it requires getting the LATEST message
    // for each unique conversation, plus counting unread messages.
    // NOTE: This example uses a MySQL/MariaDB specific pattern (user variables or ROW_NUMBER is better).
    // A simplified query structure:
    const [rows] = await pool.execute(
      `
      -- 1. Find all unique partners
      WITH Partners AS (
        SELECT DISTINCT
          CASE
            WHEN sender_id = ? THEN receiver_id
            ELSE sender_id
          END AS partner_id
        FROM messages
        WHERE sender_id = ? OR receiver_id = ?
      ),
      -- 2. Find the last message and unread count for each partner
      ConversationSummary AS (
        SELECT
          p.partner_id,
          -- Last message content and timestamp
          (SELECT content FROM messages 
           WHERE (sender_id = ? AND receiver_id = p.partner_id) OR (sender_id = p.partner_id AND receiver_id = ?)
           ORDER BY timestamp DESC LIMIT 1) AS last_message,
           
          (SELECT timestamp FROM messages 
           WHERE (sender_id = ? AND receiver_id = p.partner_id) OR (sender_id = p.partner_id AND receiver_id = ?)
           ORDER BY timestamp DESC LIMIT 1) AS last_timestamp,
           
          -- Unread count (messages SENT BY partner and NOT seen by user)
          (SELECT COUNT(*) FROM messages 
           WHERE sender_id = p.partner_id AND receiver_id = ? AND status != 'seen') AS unread_count
           
        FROM Partners p
      )
      -- 3. Combine with User info (You'll need a way to get the partner's username/info)
      -- This step needs to be done on the server-side by fetching user details 
      -- for each partner_id from your User model (not shown here).
      SELECT * FROM ConversationSummary ORDER BY last_timestamp DESC;
      `,
      [userId, userId, userId, userId, userId, userId, userId, userId, userId]
    );

    return rows; // This will return a list of partners with unread count and last message.
  }

  static async markConversationSeen(partnerId, currentUserId) {
    const [result] = await pool.execute(
      `UPDATE messages 
       SET status = 'seen' 
       WHERE sender_id = ? AND receiver_id = ? AND status != 'seen'`,
      [partnerId, currentUserId]
    );
    return result.affectedRows;
  }
}

module.exports = Message;
