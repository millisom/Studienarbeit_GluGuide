const Alert = require('../../models/alertModel');
const pool = require('../../config/db');

jest.mock('../../config/db', () => ({ query: jest.fn() }));

describe('AlertModel', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('createMealReminder', () => {
    it('inserts reminder and returns row', async () => {
      const row = { alert_id: 1, user_id: 1 };
      pool.query.mockResolvedValue({ rows: [row] });
      const result = await Alert.createMealReminder(1, 10, 'lunch', new Date());
      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO alerts'), expect.any(Array));
      expect(result).toEqual(row);
    });

    it('throws on DB error', async () => {
      pool.query.mockRejectedValue(new Error('FK violation'));
      await expect(Alert.createMealReminder(1, 10, 'lunch', new Date())).rejects.toThrow('Error creating meal reminder');
    });
  });

  describe('createAlert', () => {
    it('creates alert with email lookup and returns combined row', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ email: 'user@ex.com' }] })  
        .mockResolvedValueOnce({ rows: [{ alert_id: 2, user_id: 1 }] }); 

      const result = await Alert.createAlert(1, 'daily', '2025-05-01T08:00:00Z', 'app', 'hi');
      expect(result.email).toBe('user@ex.com');
      expect(result.alert_id).toBe(2);
    });

    it('throws when user not found', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });
      await expect(Alert.createAlert(999, 'once', '2025-05-01T08:00:00Z')).rejects.toThrow();
    });
  });

  describe('getUserIdByUsername', () => {
    it('returns user id', async () => {
      pool.query.mockResolvedValue({ rows: [{ id: 5 }] });
      const result = await Alert.getUserIdByUsername('alice');
      expect(result).toBe(5);
    });

    it('returns null when user not found', async () => {
      pool.query.mockResolvedValue({ rows: [] });
      const result = await Alert.getUserIdByUsername('nobody');
      expect(result).toBeNull();
    });
  });

  describe('getAlertsByUserId', () => {
    it('returns alerts list', async () => {
      pool.query.mockResolvedValue({ rows: [{ alert_id: 1 }, { alert_id: 2 }] });
      const result = await Alert.getAlertsByUserId(1);
      expect(result).toHaveLength(2);
    });
  });

  describe('updateAlert', () => {
    it('updates and returns alert', async () => {
      const updated = { alert_id: 1, reminder_frequency: 'weekly' };
      pool.query.mockResolvedValue({ rows: [updated] });
      const result = await Alert.updateAlert(1, 'weekly', '2025-05-01T09:00:00Z', 'app', 'msg');
      expect(result).toEqual(updated);
    });

    it('returns undefined when alert not found', async () => {
      pool.query.mockResolvedValue({ rows: [] });
      const result = await Alert.updateAlert(999, 'once', '2025-05-01T09:00:00Z');
      expect(result).toBeUndefined();
    });
  });

  describe('deleteAlert', () => {
    it('returns rowCount when deleted', async () => {
      pool.query.mockResolvedValue({ rowCount: 1 });
      const result = await Alert.deleteAlert(1);
      expect(result).toBe(1);
    });
  });

  describe('markAlertAsSent', () => {
    it('marks alert as sent', async () => {
      pool.query.mockResolvedValue({ rows: [{ alert_id: 1 }] });
      await Alert.markAlertAsSent(1);
      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE alerts'), [1]);
    });
  });

  describe('getAlertsDueForSending', () => {
    it('returns due alerts', async () => {
      pool.query.mockResolvedValue({ rows: [{ alert_id: 1 }] });
      const result = await Alert.getAlertsDueForSending();
      expect(result).toHaveLength(1);
    });
  });
});
