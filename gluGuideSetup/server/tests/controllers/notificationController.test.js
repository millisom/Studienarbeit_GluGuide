const notificationController = require('../../controllers/notificationController');
const Notification = require('../../models/notificationModel'); 


jest.mock('../../models/notificationModel');

describe('Notification Controller', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

 
    jest.spyOn(console, 'error').mockImplementation(() => {});

    req = {
      session: { userId: 42 },
      params: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe('getUnread', () => {
    it('sollte 200 und eine Liste von Benachrichtigungen zurückgeben', async () => {
      const mockNotifications = [
        { id: 1, message: 'Test 1', is_read: false },
        { id: 2, message: 'Test 2', is_read: false }
      ];
      Notification.getUnreadNotifications.mockResolvedValue(mockNotifications);

      await notificationController.getUnread(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockNotifications);
      expect(Notification.getUnreadNotifications).toHaveBeenCalledWith(42);
    });

    it('sollte 401 zurückgeben, wenn keine userId in der Session ist', async () => {
      req.session.userId = null;

      await notificationController.getUnread(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized: Please log in.' });
    });

    it('sollte 500 zurückgeben, wenn ein Datenbankfehler auftritt', async () => {
      Notification.getUnreadNotifications.mockRejectedValue(new Error('DB Error'));

      await notificationController.getUnread(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch notifications' });
    });
  });

  describe('markRead', () => {
    it('sollte 200 zurückgeben, wenn die Benachrichtigung als gelesen markiert wurde', async () => {
      req.params.id = '123';
      Notification.markAsRead.mockResolvedValue(true);

      await notificationController.markRead(req, res);

      expect(Notification.markAsRead).toHaveBeenCalledWith('123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Notification dismissed' });
    });

    it('sollte 401 zurückgeben, wenn der User nicht autorisiert ist', async () => {
      req.session.userId = null;

      await notificationController.markRead(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });

    it('sollte 500 zurückgeben, wenn das Markieren fehlschlägt', async () => {
      req.params.id = '123';
      Notification.markAsRead.mockRejectedValue(new Error('Update Error'));

      await notificationController.markRead(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to dismiss notification' });
    });
  });
});