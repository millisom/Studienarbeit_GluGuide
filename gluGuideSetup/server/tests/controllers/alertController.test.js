const alertController = require('../../controllers/alertController');
const Alert = require('../../models/alertModel');
const NotificationContext = require('../../strategies/NotificationContext');

jest.mock('../../models/alertModel');
jest.mock('../../strategies/NotificationContext');
jest.mock('../../strategies/AppNotificationStrategy');
jest.mock('../../strategies/EmailNotificationStrategy');

describe('Alert Controller', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});

    req = { session: { username: 'testuser' }, params: {}, body: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  afterEach(() => jest.restoreAllMocks());


  describe('createAlert', () => {
    it('creates alert and returns 201', async () => {
      req.body = { reminderFrequency: 'daily', reminderTime: '08:00', notificationMethod: 'app', customMessage: 'Log now!' };
      Alert.getUserIdByUsername.mockResolvedValue(42);
      Alert.createAlert.mockResolvedValue({ alert_id: 1 });

      await alertController.createAlert(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it('returns 401 when no username in session', async () => {
      req.session.username = null;
      await alertController.createAlert(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('returns 404 when user not found', async () => {
      req.body = { reminderFrequency: 'once', reminderTime: '09:00' };
      Alert.getUserIdByUsername.mockResolvedValue(null);
      await alertController.createAlert(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('accepts a full ISO reminder time without modification', async () => {
      const isoTime = '2025-05-01T08:00:00.000Z';
      req.body = { reminderFrequency: 'once', reminderTime: isoTime };
      Alert.getUserIdByUsername.mockResolvedValue(1);
      Alert.createAlert.mockResolvedValue({ alert_id: 2 });

      await alertController.createAlert(req, res);

      expect(Alert.createAlert).toHaveBeenCalledWith(
        1, 'once', isoTime, undefined, undefined
      );
    });

    it('returns 500 on model error', async () => {
      req.body = { reminderFrequency: 'daily', reminderTime: '10:00' };
      Alert.getUserIdByUsername.mockRejectedValue(new Error('DB'));
      await alertController.createAlert(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });


  describe('getAlertsByUserId', () => {
    it('returns alerts for user (200)', async () => {
      req.params.userId = '5';
      Alert.getAlertsByUserId.mockResolvedValue([{ alert_id: 1 }]);
      await alertController.getAlertsByUserId(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([{ alert_id: 1 }]);
    });

    it('returns 500 on model error', async () => {
      req.params.userId = '5';
      Alert.getAlertsByUserId.mockRejectedValue(new Error('DB'));
      await alertController.getAlertsByUserId(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });


  describe('getAlertsForCurrentUser', () => {
    it('returns alerts for session user (200)', async () => {
      Alert.getUserIdByUsername.mockResolvedValue(42);
      Alert.getAlertsByUserId.mockResolvedValue([{ alert_id: 3 }]);
      await alertController.getAlertsForCurrentUser(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('returns 401 when no username in session', async () => {
      req.session.username = null;
      await alertController.getAlertsForCurrentUser(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('returns 404 when user not found', async () => {
      Alert.getUserIdByUsername.mockResolvedValue(null);
      await alertController.getAlertsForCurrentUser(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });


  describe('updateAlert', () => {
    it('updates alert and returns 200', async () => {
      req.params.id = '10';
      req.body = { reminderFrequency: 'weekly', reminderTime: '07:30' };
      Alert.updateAlert.mockResolvedValue({ alert_id: 10 });
      await alertController.updateAlert(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('returns 404 when alert not found', async () => {
      req.params.id = '999';
      req.body = { reminderTime: '07:00' };
      Alert.updateAlert.mockResolvedValue(null);
      await alertController.updateAlert(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('returns 500 on error', async () => {
      req.params.id = '10';
      req.body = { reminderTime: '07:00' };
      Alert.updateAlert.mockRejectedValue(new Error('DB'));
      await alertController.updateAlert(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });


  describe('deleteAlert', () => {
    it('deletes alert and returns 200', async () => {
      req.params.id = '10';
      Alert.deleteAlert.mockResolvedValue(1);
      await alertController.deleteAlert(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('returns 404 when alert not found (0 rows deleted)', async () => {
      req.params.id = '999';
      Alert.deleteAlert.mockResolvedValue(0);
      await alertController.deleteAlert(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('returns 500 on error', async () => {
      req.params.id = '10';
      Alert.deleteAlert.mockRejectedValue(new Error('DB'));
      await alertController.deleteAlert(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('sendReminderEmails', () => {
    it('processes due alerts and deletes "once" reminders', async () => {
      const mockAlert = {
        alert_id: 75, user_id: 69, notification_method: 'app',
        reminder_frequency: 'once', email: 'test@user.com', custom_message: 'hello',
      };
      Alert.getAlertsDueForSending.mockResolvedValue([mockAlert]);
      const mockSend = jest.fn().mockResolvedValue(true);
      NotificationContext.prototype.send = mockSend;
      NotificationContext.prototype.setStrategy = jest.fn();
      Alert.markAlertAsSent.mockResolvedValue(true);
      Alert.deleteAlert.mockResolvedValue(1);

      await alertController.sendReminderEmails(req, res);

      expect(mockSend).toHaveBeenCalled();
      expect(Alert.markAlertAsSent).toHaveBeenCalledWith(75);
      expect(Alert.deleteAlert).toHaveBeenCalledWith(75);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('handles meal_reminder metadata and builds correct message', async () => {
      const metadata = { type: 'meal_reminder', meal_type: 'lunch', meal_id: 100 };
      const mockAlert = {
        alert_id: 80, user_id: 1, notification_method: 'email',
        reminder_frequency: 'daily', email: 'user@ex.com',
        custom_message: JSON.stringify(metadata),
      };
      Alert.getAlertsDueForSending.mockResolvedValue([mockAlert]);
      const mockSend = jest.fn().mockResolvedValue(true);
      NotificationContext.prototype.send = mockSend;
      NotificationContext.prototype.setStrategy = jest.fn();
      Alert.markAlertAsSent.mockResolvedValue(true);

      await alertController.sendReminderEmails(req, res);

      const callArgs = mockSend.mock.calls[0][1];
      expect(callArgs.subject).toBe('Time to check your blood sugar!');
      expect(Alert.deleteAlert).not.toHaveBeenCalled(); 
    });

    it('returns 500 when processing fails', async () => {
      Alert.getAlertsDueForSending.mockRejectedValue(new Error('boom'));
      await alertController.sendReminderEmails(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('does nothing when no alerts are due', async () => {
      Alert.getAlertsDueForSending.mockResolvedValue([]);
      await alertController.sendReminderEmails(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
