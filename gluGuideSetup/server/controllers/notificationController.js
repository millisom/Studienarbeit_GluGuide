const Notification = require('../models/notificationModel'); 

exports.getUnread = async (req, res) => {
  try {

    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: Please log in.' });
    }

    const notifications = await Notification.getUnreadNotifications(userId);
    res.status(200).json(notifications);
    
  } catch (error) {
    console.error("Error fetching unread notifications:", error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

exports.markRead = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    

    await Notification.markAsRead(id);
    
    res.status(200).json({ message: 'Notification dismissed' });
  } catch (error) {
    console.error("Error marking notification read:", error);
    res.status(500).json({ error: 'Failed to dismiss notification' });
  }
};