const NotificationStrategy = require('./NotificationStrategy');
const Notification = require('../models/notificationModel'); 

class AppNotificationStrategy extends NotificationStrategy {
  async send(email, data) {

    try {
      const savedNotification = await Notification.createAppNotification(
        data.userId, 
        data.subject, 
        data.message
      );
      
      console.log(`App notification saved for User ${data.userId}`);
      return savedNotification;
      
    } catch (error) {
      console.error("AppNotificationStrategy failed:", error);
      throw error;
    }
  }
}

module.exports = AppNotificationStrategy;