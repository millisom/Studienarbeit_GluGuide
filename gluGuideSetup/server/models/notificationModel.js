const pool = require('../config/db');

const Notification = {
  async createAppNotification(userId, title, message) {
    const query = `
      INSERT INTO app_notifications (user_id, title, message, is_read, created_at)
      VALUES ($1, $2, $3, false, NOW())
      RETURNING *
    `;
    const values = [userId, title, message];
    
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error('Error saving app notification: ' + error.message);
    }
  },

  async getUnreadNotifications(userId) {
    const query = 'SELECT * FROM app_notifications WHERE user_id = $1 AND is_read = false';
    const result = await pool.query(query, [userId]);
    return result.rows;
  },

  async markAsRead(notificationId) {
    const query = 'UPDATE app_notifications SET is_read = true WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [notificationId]);
    return result.rows[0];
  }
  
};

module.exports = Notification;