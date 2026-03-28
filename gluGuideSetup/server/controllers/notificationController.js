const Notification = require('../models/notificationModel');

exports.getUnread = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming you have authentication middleware setting req.user
    const notifications = await Notification.getUnreadNotifications(userId);
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

exports.markRead = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.markAsRead(id);
    res.status(200).json({ message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};