const pool = require('../config/db');

const Alert = {


  async createAlert(userId, reminderFrequency, reminderTime, notificationMethod = 'app', customMessage = '') {
    try {
      const emailQuery = 'SELECT email FROM users WHERE id = $1';
      const emailResult = await pool.query(emailQuery, [userId]);

      if (emailResult.rows.length === 0) {
        throw new Error('User not found');
      }

      const email = emailResult.rows[0].email;


      const alertQuery = `
        INSERT INTO alerts (user_id, reminder_frequency, reminder_time, notification_method, custom_message, created_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
        RETURNING *
      `;
      const alertValues = [userId, reminderFrequency, reminderTime, notificationMethod, customMessage];
      const alertResult = await pool.query(alertQuery, alertValues);

      return { ...alertResult.rows[0], email }; 
    } catch (error) {
      throw new Error('Error creating alert: ' + error.message);
    }
  },

  async getUserIdByUsername(username) {
    const query = 'SELECT id FROM users WHERE username = $1';
    const values = [username];

    try {
      const result = await pool.query(query, values);
      if (result.rows.length === 0) {
        return null; 
      }
      return result.rows[0].id; 
    } catch (error) {
      throw new Error('Error fetching user ID: ' + error.message);
    }
  },

  async getAlertsByUserId(userId) {
    const query = 'SELECT * FROM alerts WHERE user_id = $1 ORDER BY created_at ASC';
    const values = [userId];
    try {
      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      throw new Error('Error fetching alerts: ' + error.message);
    }
  },


  async updateAlert(alertId, reminderFrequency, reminderTime, notificationMethod, customMessage) {
    const query = `
      UPDATE alerts
      SET 
        reminder_frequency = $1, 
        reminder_time = $2, 
        notification_method = COALESCE($3, notification_method),
        custom_message = COALESCE($4, custom_message),
        updated_at = NOW()
      WHERE alert_id = $5
      RETURNING *
    `;
    const values = [reminderFrequency, reminderTime, notificationMethod || null, customMessage || null, alertId];
    try {
      const result = await pool.query(query, values);
      if (result.rowCount === 0) {
        return null;
      }
      return result.rows[0];
    } catch (error) {
      throw new Error('Error updating alert: ' + error.message);
    }
  },

  async deleteAlert(alertId) {
    const query = 'DELETE FROM alerts WHERE alert_id = $1 RETURNING *';
    const values = [alertId];
    try {
      const result = await pool.query(query, values);
      return result.rowCount;
    } catch (error) {
      throw new Error('Error deleting alert: ' + error.message);
    }
  },


  async getAlertsDueForSending() {
    const query = `
      SELECT a.*, u.email 
      FROM alerts a 
      JOIN users u ON a.user_id = u.id 
      WHERE a.reminder_time <= (CURRENT_TIMESTAMP AT TIME ZONE 'Europe/Berlin')::time
      AND (
        a.last_sent_at IS NULL 
        OR (a.reminder_frequency = 'daily' AND a.last_sent_at::date < CURRENT_DATE)
        OR (a.reminder_frequency = 'weekly' AND a.last_sent_at < NOW() - INTERVAL '7 days')
        -- If frequency is 'once' and last_sent_at is NOT NULL, it won't be picked up again!
      )
    `;
    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw new Error('Error fetching due alerts: ' + error.message);
    }
  },

  async markAlertAsSent(alertId) {
    const query = `UPDATE alerts SET last_sent_at = NOW() WHERE alert_id = $1`;
    try {
      await pool.query(query, [alertId]);
    } catch (error) {
      throw new Error('Error marking alert as sent: ' + error.message);
    }
  }
};

module.exports = Alert;