const LogModel = require('../../models/glucoseModel');
const db = require('../../config/db');

jest.mock('../../config/db', () => ({ query: jest.fn() }));

describe('GlucoseModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => jest.restoreAllMocks());

  describe('createLog', () => {
    it('inserts and returns new log', async () => {
      const row = { id: 1, user_id: 1, glucose_level: 110 };
      db.query.mockResolvedValue({ rows: [row] });
      const result = await LogModel.createLog(1, '2025-01-01', '12:00', 110, null, 'fasting');
      expect(db.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO glucose_logs'), [1, '2025-01-01', '12:00', 110, null, 'fasting']);
      expect(result).toEqual(row);
    });

    it('throws on DB error', async () => {
      db.query.mockRejectedValue(new Error('DB'));
      await expect(LogModel.createLog(1, '2025-01-01', '12:00', 90)).rejects.toThrow();
    });
  });

  describe('getLogsByFilter', () => {
    it('queries with 24hours filter', async () => {
      db.query.mockResolvedValue({ rows: [{ id: 1 }] });
      const result = await LogModel.getLogsByFilter(1, '24hours');
      expect(db.query).toHaveBeenCalledWith(expect.stringContaining('1 day'), [1]);
      expect(result).toHaveLength(1);
    });

    it('queries with 1week filter', async () => {
      db.query.mockResolvedValue({ rows: [] });
      await LogModel.getLogsByFilter(1, '1week');
      expect(db.query).toHaveBeenCalledWith(expect.stringContaining('7 days'), [1]);
    });

    it('queries with 3months filter', async () => {
      db.query.mockResolvedValue({ rows: [] });
      await LogModel.getLogsByFilter(1, '3months');
      expect(db.query).toHaveBeenCalledWith(expect.stringContaining('3 months'), [1]);
    });

    it('uses default query for unknown filter', async () => {
      db.query.mockResolvedValue({ rows: [] });
      await LogModel.getLogsByFilter(1, 'all');
      expect(db.query).toHaveBeenCalled();
    });

    it('throws when userId is missing', async () => {
      await expect(LogModel.getLogsByFilter(null, '24hours')).rejects.toThrow('User ID is required');
    });
  });

  describe('getLogsByUser', () => {
    it('returns all logs for user', async () => {
      db.query.mockResolvedValue({ rows: [{ id: 1 }, { id: 2 }] });
      const result = await LogModel.getLogsByUser(1);
      expect(db.query).toHaveBeenCalledWith(expect.stringContaining('WHERE user_id = $1'), [1]);
      expect(result).toHaveLength(2);
    });
  });

  describe('getLogsByTimePeriod', () => {
    it('returns logs for given time period', async () => {
      db.query.mockResolvedValue({ rows: [{ id: 1 }] });
      const result = await LogModel.getLogsByTimePeriod(1, '7 days');
      expect(db.query).toHaveBeenCalledWith(expect.any(String), [1, '7 days']);
      expect(result).toHaveLength(1);
    });

    it('throws when userId or timePeriod is missing', async () => {
      await expect(LogModel.getLogsByTimePeriod(null, '7 days')).rejects.toThrow();
    });
  });

  describe('getLogById', () => {
    it('returns single log', async () => {
      db.query.mockResolvedValue({ rows: [{ id: 5 }] });
      const result = await LogModel.getLogById(5);
      expect(result).toEqual({ id: 5 });
    });
  });

  describe('updateLog', () => {
    it('updates and returns updated log', async () => {
      const updated = { id: 1, glucose_level: 120 };
      db.query.mockResolvedValue({ rows: [updated] });
      const result = await LogModel.updateLog(1, 1, '2025-01-01', '12:00', 120, null, null);
      expect(db.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE glucose_logs'), expect.any(Array));
      expect(result).toEqual(updated);
    });
  });

  describe('deleteLog', () => {
    it('returns true when row deleted', async () => {
      db.query.mockResolvedValue({ rowCount: 1 });
      const result = await LogModel.deleteLog(1, 1);
      expect(result).toBe(true);
    });

    it('returns false when no row deleted', async () => {
      db.query.mockResolvedValue({ rowCount: 0 });
      const result = await LogModel.deleteLog(999, 1);
      expect(result).toBe(false);
    });
  });
});
