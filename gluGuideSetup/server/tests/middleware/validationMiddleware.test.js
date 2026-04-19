const { validateFoodItem, validateRecipe, validateGlucoseLog } = require('../../middleware/validationMiddleware');

describe('validationMiddleware', () => {
  let req, res, next;

  beforeEach(() => {
    req  = { body: {} };
    res  = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });


  describe('validateFoodItem', () => {
    it('calls next() for valid food item', () => {
      req.body = { name: 'Apple', calories: 52, carbs: 14, proteins: 0.3, fats: 0.2 };
      validateFoodItem(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('returns 400 when name is missing', () => {
      req.body = { calories: 52, carbs: 14, proteins: 0.3, fats: 0.2 };
      validateFoodItem(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });

    it('returns 400 when calories is null', () => {
      req.body = { name: 'Apple', calories: null, carbs: 14, proteins: 0.3, fats: 0.2 };
      validateFoodItem(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('returns 400 when calories is a string instead of number', () => {
      req.body = { name: 'Apple', calories: '52', carbs: 14, proteins: 0.3, fats: 0.2 };
      validateFoodItem(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.stringContaining('must be numbers') })
      );
    });

    it('returns 400 when any of carbs/proteins/fats is missing', () => {
      req.body = { name: 'Apple', calories: 52, carbs: 14 };
      validateFoodItem(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('accepts zero as a valid numeric value', () => {
      req.body = { name: 'Water', calories: 0, carbs: 0, proteins: 0, fats: 0 };
      validateFoodItem(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });


  describe('validateRecipe', () => {
    it('calls next() for a valid recipe', () => {
      req.body = {
        name: 'Pasta',
        ingredients: [{ food_id: 1, quantity_in_grams: 100 }],
        instructions: ['Cook pasta'],
      };
      validateRecipe(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('returns 400 when name is missing', () => {
      req.body = {
        ingredients: [{ food_id: 1 }],
        instructions: ['Step 1'],
      };
      validateRecipe(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Recipe name is required.' });
    });

    it('returns 400 when name is only whitespace', () => {
      req.body = { name: '   ', ingredients: [{}], instructions: ['s'] };
      validateRecipe(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('returns 400 when ingredients array is empty', () => {
      req.body = { name: 'Pasta', ingredients: [], instructions: ['Step 1'] };
      validateRecipe(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'At least one ingredient is required.' });
    });

    it('returns 400 when ingredients is not an array', () => {
      req.body = { name: 'Pasta', ingredients: 'flour', instructions: ['s'] };
      validateRecipe(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('returns 400 when instructions array is empty', () => {
      req.body = {
        name: 'Pasta',
        ingredients: [{ food_id: 1 }],
        instructions: [],
      };
      validateRecipe(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'At least one instruction step is required.' });
    });

    it('returns 400 when instructions is not an array', () => {
      req.body = { name: 'Pasta', ingredients: [{ food_id: 1 }], instructions: 'cook' };
      validateRecipe(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });


  describe('validateGlucoseLog', () => {
    it('calls next() for a valid log entry in the past', () => {
      req.body = { date: '2024-01-01', time: '08:00', glucoseLevel: '110' };
      validateGlucoseLog(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('returns 400 when date is missing', () => {
      req.body = { time: '08:00', glucoseLevel: '110' };
      validateGlucoseLog(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('returns 400 when time is missing', () => {
      req.body = { date: '2024-01-01', glucoseLevel: '110' };
      validateGlucoseLog(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('returns 400 when glucoseLevel is missing', () => {
      req.body = { date: '2024-01-01', time: '08:00' };
      validateGlucoseLog(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('returns 400 for non-numeric glucoseLevel', () => {
      req.body = { date: '2024-01-01', time: '08:00', glucoseLevel: 'abc' };
      validateGlucoseLog(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('positive number') })
      );
    });

    it('returns 400 for zero or negative glucoseLevel', () => {
      req.body = { date: '2024-01-01', time: '08:00', glucoseLevel: '0' };
      validateGlucoseLog(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('returns 400 for a future date/time', () => {
      const future = new Date(Date.now() + 60 * 60 * 1000);
      const dateStr = future.toISOString().split('T')[0];
      const timeStr = future.toTimeString().slice(0, 5);
      req.body = { date: dateStr, time: timeStr, glucoseLevel: '110' };
      validateGlucoseLog(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('future') })
      );
    });
  });
});
