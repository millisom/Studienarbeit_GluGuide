const NotificationContext  = require('../../strategies/NotificationContext');
const NotificationStrategy = require('../../strategies/NotificationStrategy');
const AppNotificationStrategy = require('../../strategies/AppNotificationStrategy');
const Notification = require('../../models/notificationModel');

jest.mock('../../models/notificationModel');


describe('NotificationStrategy', () => {
  it('send() throws "not implemented" error', async () => {
    const strategy = new NotificationStrategy();
    await expect(strategy.send('a@b.com', {})).rejects.toThrow(
      'send method not implemented in NotificationStrategy'
    );
  });
});


describe('NotificationContext', () => {
  it('setStrategy() changes the active strategy', async () => {
    const mockStrategy = { send: jest.fn().mockResolvedValue('sent') };
    const ctx = new NotificationContext(mockStrategy);

    await ctx.send('test@ex.com', { subject: 'Hi', message: 'Hello', userId: 1 });
    expect(mockStrategy.send).toHaveBeenCalledWith('test@ex.com', expect.objectContaining({ subject: 'Hi' }));
  });

  it('delegates send() to the current strategy', async () => {
    const stratA = { send: jest.fn().mockResolvedValue('from A') };
    const stratB = { send: jest.fn().mockResolvedValue('from B') };

    const ctx = new NotificationContext(stratA);
    await ctx.send('a@ex.com', {});
    expect(stratA.send).toHaveBeenCalledTimes(1);
    expect(stratB.send).not.toHaveBeenCalled();

    ctx.setStrategy(stratB);
    await ctx.send('b@ex.com', {});
    expect(stratB.send).toHaveBeenCalledTimes(1);
  });

  it('can be constructed without an initial strategy', () => {
    const ctx = new NotificationContext();
    expect(ctx.strategy).toBeUndefined();
  });
});


describe('AppNotificationStrategy', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => jest.restoreAllMocks());

  it('calls Notification.createAppNotification with correct args and returns result', async () => {
    const savedNotif = { id: 1, user_id: 5, title: 'Reminder', message: 'Log now' };
    Notification.createAppNotification.mockResolvedValue(savedNotif);

    const strategy = new AppNotificationStrategy();
    const data = { userId: 5, subject: 'Reminder', message: 'Log now' };
    const result = await strategy.send('ignored@email.com', data);

    expect(Notification.createAppNotification).toHaveBeenCalledWith(5, 'Reminder', 'Log now');
    expect(result).toEqual(savedNotif);
  });

  it('throws when Notification.createAppNotification fails', async () => {
    Notification.createAppNotification.mockRejectedValue(new Error('DB error'));
    const strategy = new AppNotificationStrategy();
    await expect(
      strategy.send('x@ex.com', { userId: 1, subject: 'S', message: 'M' })
    ).rejects.toThrow('DB error');
  });

  it('extends NotificationStrategy', () => {
    const strategy = new AppNotificationStrategy();
    expect(strategy).toBeInstanceOf(NotificationStrategy);
  });
});
