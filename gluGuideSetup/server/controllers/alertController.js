const Alert = require('../models/alertModel');
const NotificationContext = require('../strategies/NotificationContext');
const EmailNotificationStrategy = require('../strategies/EmailNotificationStrategy');
const AppNotificationStrategy = require('../strategies/AppNotificationStrategy');

async function processDueAlerts() {
  try {
    const alerts = await Alert.getAlertsDueForSending();
    if (!alerts || alerts.length === 0) {
      return;
    }

    const notificationContext = new NotificationContext();

    for (const alert of alerts) {

      let subject, message, metadata;
      try {
        metadata = JSON.parse(alert.custom_message);
      } catch {
        metadata = null;
      }

      if (metadata && metadata.type === 'meal_reminder') {

        subject = 'Time to check your blood sugar!';
        message = JSON.stringify({
          type: 'meal_reminder',
          text: `It has been 1 hour since your ${metadata.meal_type}. Please log your glucose now.`,
          meal_id: metadata.meal_id,
          meal_type: metadata.meal_type
        });
      } else {

        subject = 'Sugar Log Reminder';
        message = alert.custom_message || 'Hi! Just a friendly reminder to log your sugar levels today.';
      }

      const notificationData = {
        subject,
        message,
        userId: alert.user_id
      };

      if (alert.notification_method === 'app') {
        notificationContext.setStrategy(new AppNotificationStrategy());
      } else {
        notificationContext.setStrategy(new EmailNotificationStrategy());
      }

      await notificationContext.send(alert.email, notificationData);
      console.log(`Reminder (${alert.notification_method}) sent to User ${alert.user_id} | type: ${metadata?.type || 'generic'}`);

      await Alert.markAlertAsSent(alert.alert_id);

      if (alert.reminder_frequency === 'once') {
        await Alert.deleteAlert(alert.alert_id);
      }
    }
  } catch (error) {
    console.error('Error processing due alerts:', error.message);
    throw error; 
  }
}

const alertController = {
  async createAlert(req, res) {
    const { reminderFrequency, reminderTime, notificationMethod, customMessage } = req.body;
    const username = req.session?.username;

    if (!username) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: No username found in session',
      });
    }

    try {
      const userId = await Alert.getUserIdByUsername(username);
      if (!userId) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }


      let fullReminderTime = reminderTime;
      if (reminderTime && !reminderTime.includes('T') && !reminderTime.includes('-')) {
        const today = new Date().toISOString().split('T')[0];
        fullReminderTime = new Date(`${today}T${reminderTime}:00`).toISOString();
      }

      const alert = await Alert.createAlert(userId, reminderFrequency, fullReminderTime, notificationMethod, customMessage);
      res.status(201).json({ success: true, message: 'Alert preferences saved!', alert });
    } catch (error) {
      console.error('Error creating alert:', error.message);
      res.status(500).json({ success: false, message: 'Failed to save alert preferences' });
    }
  },

  async getAlertsByUserId(req, res) {
    const { userId } = req.params;
    try {
      const alerts = await Alert.getAlertsByUserId(userId);
      res.status(200).json(alerts);
    } catch (error) {
      console.error('Error fetching alerts:', error.message);
      res.status(500).json({ success: false, message: 'Failed to fetch alerts' });
    }
  },

  async getAlertsForCurrentUser(req, res) {
    const username = req.session?.username;
    if (!username) {
      return res.status(401).json({ success: false, message: 'Unauthorized: No username found in session' });
    }
    try {
      const userId = await Alert.getUserIdByUsername(username);
      if (!userId) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      const alerts = await Alert.getAlertsByUserId(userId);
      res.status(200).json(alerts);
    } catch (error) {
      console.error('Error fetching alerts for user:', error.message);
      res.status(500).json({ success: false, message: 'Failed to fetch alerts' });
    }
  },

async updateAlert(req, res) {
    const { id: alertId } = req.params;
    const { reminderFrequency, reminderTime, notificationMethod, customMessage } = req.body;

    let fullReminderTime = reminderTime;
    if (reminderTime && !reminderTime.includes('T') && !reminderTime.includes('-')) {
      const today = new Date().toISOString().split('T')[0];
      fullReminderTime = new Date(`${today}T${reminderTime}:00`).toISOString();
    }

    try {
      const updatedAlert = await Alert.updateAlert(alertId, reminderFrequency, fullReminderTime, notificationMethod, customMessage);
      if (!updatedAlert) {
        return res.status(404).json({ success: false, message: 'Alert not found' });
      }
      res.status(200).json({ success: true, message: 'Alert updated successfully', alert: updatedAlert });
    } catch (error) {
      console.error('Error updating alert:', error.message);
      res.status(500).json({ success: false, message: 'Failed to update alert' });
    }
  },

  async deleteAlert(req, res) {
    const { id: alertId } = req.params;
    try {
      const deletedRows = await Alert.deleteAlert(alertId);
      if (deletedRows === 0) {
        return res.status(404).json({ success: false, message: 'Alert not found' });
      }
      res.status(200).json({ success: true, message: 'Alert deleted successfully' });
    } catch (error) {
      console.error('Error deleting alert:', error.message);
      res.status(500).json({ success: false, message: 'Failed to delete alert' });
    }
  },

  async sendReminderEmails(req, res) {
    if (res) {
      try {
        await processDueAlerts();
        res.status(200).json({ success: true, message: 'Alerts processed successfully' });
      } catch (error) {
        console.error('Error processing alerts:', error.message);
        res.status(500).json({ success: false, message: 'Failed to process alerts' });
      }
    } else {
      try {
        await processDueAlerts();
      } catch (error) {
        console.error('Cron job error:', error.message);
      }
    }
  },
};

module.exports = alertController;
