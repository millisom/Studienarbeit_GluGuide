const glucoseController = require('../../controllers/glucoseController');
const LogModel = require('../../models/glucoseModel');
const Alert = require('../../models/alertModel');

jest.mock('../../models/glucoseModel');
jest.mock('../../models/alertModel', () => ({
  createMealReminder: jest.fn(),
}));

describe('GlucoseController', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});

    req = { body: {}, params: {}, query: {}, session: { userId: 1 } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  afterEach(() => jest.restoreAllMocks());


  describe('logGlucose', () => {
    it('creates log and returns 201', async () => {
      req.body = { date: '2025-01-01', time: '12:00', glucoseLevel: 110, meal_id: 1, reading_type: 'fasting' };
      LogModel.createLog.mockResolvedValue({ id: 1, ...req.body });

      await glucoseController.logGlucose(req, res);

      expect(LogModel.createLog).toHaveBeenCalledWith(1, '2025-01-01', '12:00', 110, 1, 'fasting');
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('returns 400 when no userId in session', async () => {
      req.session.userId = undefined;
      await glucoseController.logGlucose(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(LogModel.createLog).not.toHaveBeenCalled();
    });

    it('returns 500 when model throws', async () => {
      req.body = { date: '2025-01-01', time: '12:00', glucoseLevel: 100 };
      LogModel.createLog.mockRejectedValue(new Error('DB Error'));
      await glucoseController.logGlucose(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('creates 2h follow-up reminder when 1h_post_meal reading > 140', async () => {
      req.body = { date: '2025-01-01', time: '12:00', glucoseLevel: 160, meal_id: 5, reading_type: '1h_post_meal' };
      LogModel.createLog.mockResolvedValue({ id: 1 });
      Alert.createMealReminder.mockResolvedValue(true);

      await glucoseController.logGlucose(req, res);

      expect(Alert.createMealReminder).toHaveBeenCalledWith(1, 5, '2h_followup', expect.any(Date));
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('does NOT create reminder for 1h_post_meal reading <= 140', async () => {
      req.body = { date: '2025-01-01', time: '12:00', glucoseLevel: 130, meal_id: 5, reading_type: '1h_post_meal' };
      LogModel.createLog.mockResolvedValue({ id: 1 });

      await glucoseController.logGlucose(req, res);
      expect(Alert.createMealReminder).not.toHaveBeenCalled();
    });

    it('does NOT create reminder for non-1h_post_meal reading type', async () => {
      req.body = { date: '2025-01-01', time: '12:00', glucoseLevel: 200, meal_id: 5, reading_type: 'fasting' };
      LogModel.createLog.mockResolvedValue({ id: 1 });

      await glucoseController.logGlucose(req, res);
      expect(Alert.createMealReminder).not.toHaveBeenCalled();
    });
  });


  describe('getUserGlucoseLogs', () => {
    it('returns logs for user (200)', async () => {
      req.params.userId = '1';
      LogModel.getLogsByUser.mockResolvedValue([{ id: 1 }, { id: 2 }]);
      await glucoseController.getUserGlucoseLogs(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([{ id: 1 }, { id: 2 }]);
    });

    it('returns 404 when no logs found', async () => {
      req.params.userId = '1';
      LogModel.getLogsByUser.mockResolvedValue([]);
      await glucoseController.getUserGlucoseLogs(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('returns 500 on model error', async () => {
      req.params.userId = '1';
      LogModel.getLogsByUser.mockRejectedValue(new Error('DB'));
      await glucoseController.getUserGlucoseLogs(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });


  describe('getFilteredGlucoseLogs', () => {
    it('returns filtered logs (200)', async () => {
      req.params.userId = '1';
      req.query.filter = '24hours';
      LogModel.getLogsByFilter.mockResolvedValue([{ id: 1 }]);
      await glucoseController.getFilteredGlucoseLogs(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('returns 404 when no logs match filter', async () => {
      req.params.userId = '1';
      req.query.filter = '24hours';
      LogModel.getLogsByFilter.mockResolvedValue([]);
      await glucoseController.getFilteredGlucoseLogs(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('returns 500 on model error', async () => {
      req.params.userId = '1';
      LogModel.getLogsByFilter.mockRejectedValue(new Error('DB'));
      await glucoseController.getFilteredGlucoseLogs(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });


  describe('getGlucoseLogsByTimePeriod', () => {
    it('returns logs for valid time period (200)', async () => {
      req.params.userId = '1';
      req.query.timePeriod = '7 days';
      LogModel.getLogsByTimePeriod.mockResolvedValue([{ id: 1 }]);
      await glucoseController.getGlucoseLogsByTimePeriod(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('returns 400 for invalid time period', async () => {
      req.params.userId = '1';
      req.query.timePeriod = 'yesterday';
      await glucoseController.getGlucoseLogsByTimePeriod(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('returns 400 when timePeriod is missing', async () => {
      req.params.userId = '1';
      req.query.timePeriod = undefined;
      await glucoseController.getGlucoseLogsByTimePeriod(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('returns 404 when no logs found', async () => {
      req.params.userId = '1';
      req.query.timePeriod = '1 day';
      LogModel.getLogsByTimePeriod.mockResolvedValue([]);
      await glucoseController.getGlucoseLogsByTimePeriod(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });


  describe('getGlucoseLogById', () => {
    it('returns log by id (200)', async () => {
      req.params.id = '5';
      LogModel.getLogById.mockResolvedValue({ id: 5 });
      await glucoseController.getGlucoseLogById(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('returns 404 when log not found', async () => {
      req.params.id = '999';
      LogModel.getLogById.mockResolvedValue(null);
      await glucoseController.getGlucoseLogById(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });


  describe('updateGlucoseLog', () => {
    it('updates log and returns 200', async () => {
      req.params.id = '5';
      req.body = { date: '2025-01-01', time: '12:00', glucoseLevel: 110 };
      LogModel.updateLog.mockResolvedValue({ id: 5 });
      await glucoseController.updateGlucoseLog(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('returns 400 for non-numeric id', async () => {
      req.params.id = 'abc';
      await glucoseController.updateGlucoseLog(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('returns 401 when not logged in', async () => {
      req.params.id = '5';
      req.session.userId = null;
      await glucoseController.updateGlucoseLog(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('returns 403 when log not found or unauthorized', async () => {
      req.params.id = '5';
      LogModel.updateLog.mockResolvedValue(null);
      await glucoseController.updateGlucoseLog(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  
  describe('deleteGlucoseLog', () => {
    it('deletes log and returns 200', async () => {
      req.params.id = '5';
      LogModel.deleteLog.mockResolvedValue(true);
      await glucoseController.deleteGlucoseLog(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Log deleted successfully' });
    });

    it('returns 403 when log not found or unauthorized', async () => {
      req.params.id = '5';
      LogModel.deleteLog.mockResolvedValue(false);
      await glucoseController.deleteGlucoseLog(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('returns 500 on model error', async () => {
      req.params.id = '5';
      LogModel.deleteLog.mockRejectedValue(new Error('DB'));
      await glucoseController.deleteGlucoseLog(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
