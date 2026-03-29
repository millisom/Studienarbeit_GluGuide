const alertController = require('../../controllers/alertController');
const Alert = require('../../models/alertModel');
const NotificationContext = require('../../strategies/NotificationContext');


jest.mock('../../models/alertModel');
jest.mock('../../strategies/NotificationContext');
jest.mock('../../strategies/AppNotificationStrategy');
jest.mock('../../strategies/EmailNotificationStrategy');

describe('Alert Controller - Background Processing', () => {
  it('should process due alerts and delete "once" reminders', async () => {
    const mockAlert = {
      alert_id: 75,
      user_id: 69,
      notification_method: 'app',
      reminder_frequency: 'once',
      email: 'test@user.com',
      custom_message: 'Test popup'
    };


    Alert.getAlertsDueForSending.mockResolvedValue([mockAlert]);
    

    const mockSend = jest.fn();
    NotificationContext.prototype.send = mockSend;
    NotificationContext.prototype.setStrategy = jest.fn();


    await alertController.sendReminderEmails();

  
    expect(mockSend).toHaveBeenCalled();
    

    expect(Alert.markAlertAsSent).toHaveBeenCalledWith(75);


    expect(Alert.deleteAlert).toHaveBeenCalledWith(75);
  });
});