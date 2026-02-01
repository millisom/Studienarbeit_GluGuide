const glucoseController = require('../../controllers/glucoseController');
const LogModel = require('../../models/glucoseModel');


jest.mock('../../models/glucoseModel');

describe('GlucoseController Validation (Status Quo)', () => {
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

    it('sollte 400 zurückgeben, wenn Felder fehlen', async () => {
        req.body = { date: '2023-01-01' };
        await glucoseController.logGlucose(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining('required') }));
    });

    it('sollte 400 zurückgeben, wenn Glucose-Level negativ ist', async () => {
        req.body = { date: '2023-01-01', time: '12:00', glucoseLevel: -5 };
        await glucoseController.logGlucose(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining('positive number') }));
    });

    it('sollte 400 zurückgeben, wenn Datum in der Zukunft liegt', async () => {
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 1); 
        
        const dateStr = futureDate.toISOString().split('T')[0];
        req.body = { date: dateStr, time: '12:00', glucoseLevel: 100 };

        await glucoseController.logGlucose(req, res);
        
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining('future') }));
    });

    it('sollte LogModel aufrufen, wenn alles valide ist', async () => {
        req.body = { date: '2020-01-01', time: '12:00', glucoseLevel: 100 };
        LogModel.createLog.mockResolvedValue({ id: 1 });

        await glucoseController.logGlucose(req, res);

        expect(LogModel.createLog).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(201);
    });
});