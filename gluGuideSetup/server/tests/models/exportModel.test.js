const ExportModel = require('../../models/exportModel');
const pool        = require('../../config/db');

jest.mock('../../config/db', () => ({ query: jest.fn() }));

describe('ExportModel', () => {
  beforeEach(() => jest.clearAllMocks());


  describe('getAvailableDates', () => {
    it('returns array of ISO date strings', async () => {
      const rows = [
        { log_date: new Date('2025-05-01T00:00:00Z') },
        { log_date: new Date('2025-05-02T00:00:00Z') },
      ];
      pool.query.mockResolvedValue({ rows });

      const result = await ExportModel.getAvailableDates(1, '2025-04-01');
      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('UNION'), [1, '2025-04-01']);
      expect(result).toEqual(['2025-05-01', '2025-05-02']);
    });

    it('returns empty array when no data', async () => {
      pool.query.mockResolvedValue({ rows: [] });
      const result = await ExportModel.getAvailableDates(1, '2025-04-01');
      expect(result).toEqual([]);
    });

    it('throws on DB error', async () => {
      pool.query.mockRejectedValue(new Error('DB'));
      await expect(ExportModel.getAvailableDates(1, '2025-04-01')).rejects.toThrow();
    });
  });


  describe('getReportData', () => {
    it('returns meals and glucoseLogs from parallel queries', async () => {
      const mealsRows   = [{ meal_id: 1, meal_type: 'lunch' }];
      const glucoseRows = [{ id: 1, glucose_level: 110 }];

      pool.query
        .mockResolvedValueOnce({ rows: mealsRows })
        .mockResolvedValueOnce({ rows: glucoseRows });

      const result = await ExportModel.getReportData(1, ['2025-05-01']);
      expect(result.meals).toEqual(mealsRows);
      expect(result.glucoseLogs).toEqual(glucoseRows);
    });

    it('runs both queries in parallel (Promise.all)', async () => {
      pool.query.mockResolvedValue({ rows: [] });
      await ExportModel.getReportData(1, ['2025-05-01']);
      expect(pool.query).toHaveBeenCalledTimes(2);
    });

    it('throws when either query fails', async () => {
      pool.query.mockRejectedValue(new Error('DB'));
      await expect(ExportModel.getReportData(1, ['2025-05-01'])).rejects.toThrow();
    });
  });
});
