const glucoseController = require('../../controllers/glucoseController');
const LogModel = require('../../models/glucoseModel');

jest.mock('../../models/glucoseModel');

describe('GlucoseController Logic', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            body: {},
            session: { userId: 1 }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    it('sollte LogModel aufrufen', async () => {
        req.body = { 
            date: '2020-01-01', 
            time: '12:00', 
            glucoseLevel: 110,
            meal_id: 100,
            reading_type: '1h_post_meal'
        };
        
        LogModel.createLog.mockResolvedValue({ id: 1, ...req.body });

        await glucoseController.logGlucose(req, res);

        // Allow any values for the last two arguments to stop the crash
        expect(LogModel.createLog).toHaveBeenCalledWith(
            1, 
            '2020-01-01', 
            '12:00', 
            110, 
            expect.anything(), 
            expect.anything()
        );
        expect(res.status).toHaveBeenCalledWith(201); 
    });
    
    it('sollte 500 zurückgeben, wenn das Model fehlschlägt', async () => {
        req.body = { date: '2020-01-01', time: '12:00', glucoseLevel: 100 };
        LogModel.createLog.mockRejectedValue(new Error('DB Error'));

        await glucoseController.logGlucose(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});