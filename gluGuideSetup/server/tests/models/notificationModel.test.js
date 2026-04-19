const Notification = require('../../models/notificationModel');
const pool = require('../../config/db');

jest.mock('../../config/db', () => ({ query: jest.fn() }));

describe('NotificationModel', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('createAppNotification', () => {
    it('inserts notification and returns row', async () => {
      const row = { id: 1, user_id: 1, title: 'Reminder', message: 'Log now', is_read: false };
      pool.query.mockResolvedValue({ rows: [row] });
      const result = await Notification.createAppNotification(1, 'Reminder', 'Log now');
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO app_notifications'),
        [1, 'Reminder', 'Log now']
      );
      expect(result).toEqual(row);
    });

    it('throws on DB error', async () => {
      pool.query.mockRejectedValue(new Error('DB'));
      await expect(Notification.createAppNotification(1, 't', 'm')).rejects.toThrow('Error saving app notification');
    });
  });

  describe('getUnreadNotifications', () => {
    it('returns unread notifications', async () => {
      pool.query.mockResolvedValue({ rows: [{ id: 1 }, { id: 2 }] });
      const result = await Notification.getUnreadNotifications(1);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('is_read = false'),
        [1]
      );
      expect(result).toHaveLength(2);
    });
  });

  describe('markAsRead', () => {
    it('marks notification as read and returns row', async () => {
      const row = { id: 5, is_read: true };
      pool.query.mockResolvedValue({ rows: [row] });
      const result = await Notification.markAsRead(5);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('is_read = true'),
        [5]
      );
      expect(result).toEqual(row);
    });
  });
});
