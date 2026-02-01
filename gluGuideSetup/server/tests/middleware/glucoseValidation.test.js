const { validateGlucoseLog } = require('../../middleware/validationMiddleware');

describe('Glucose Validation Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = { body: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
    });

    it('sollte next() aufrufen, wenn Daten valide sind', () => {
        req.body = { date: '2020-01-01', time: '12:00', glucoseLevel: 100 };
        
        validateGlucoseLog(req, res, next);
        
        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });

    it('sollte 400 senden, wenn Felder fehlen', () => {
        req.body = { date: '2020-01-01' }; 
        
        validateGlucoseLog(req, res, next);
        
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining('required') }));
        expect(next).not.toHaveBeenCalled(); 
    });

    it('sollte 400 senden, wenn Datum in der Zukunft', () => {
        const future = new Date();
        future.setFullYear(future.getFullYear() + 1);
        
        req.body = { 
            date: future.toISOString().split('T')[0], 
            time: '12:00', 
            glucoseLevel: 90 
        };
        
        validateGlucoseLog(req, res, next);
        
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining('future') }));
        expect(next).not.toHaveBeenCalled();
    });
});