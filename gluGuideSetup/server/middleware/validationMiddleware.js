function validateFoodItem(req, res, next) {
    const { name, calories, carbs, proteins, fats } = req.body;

    if (!name || calories == null || carbs == null || proteins == null || fats == null) {
        return res.status(400).json({ 
            message: 'Missing required fields for FoodItem: name, calories, carbs, proteins, fats are all required.' 
        });
    }

    if (typeof calories !== 'number' || typeof carbs !== 'number' || typeof proteins !== 'number' || typeof fats !== 'number') {
        return res.status(400).json({ 
            message: 'Calories, carbs, proteins, and fats must be numbers.' 
        });
    }

    next();
}


const validateRecipe = (req, res, next) => {
    const { name, ingredients, instructions } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({
        message: 'Recipe name is required.'
        });
    }
    if (!Array.isArray(ingredients) || ingredients.length === 0) {
        return res.status(400).json({
        message: 'At least one ingredient is required.'
        });
    }
    if (!Array.isArray(instructions) || instructions.length === 0) {
        return res.status(400).json({
        message: 'At least one instruction step is required.'
        });
    }
    next();
}

const validateGlucoseLog = (req, res, next) => {
    const { date, time, glucoseLevel } = req.body;
    
    if (!date || !time || !glucoseLevel) {
        return res.status(400).json({ error: 'All fields are required: userId, date, time, glucoseLevel' });
    }

    const glucoseNum = parseFloat(glucoseLevel);
    if (isNaN(glucoseNum) || glucoseNum <= 0) {
        return res.status(400).json({ error: 'Glucose level must be a positive number.' });
    }

    const submittedTimestamp = new Date(`${date}T${time}`);
    const currentTimestamp = new Date();

    if (submittedTimestamp > currentTimestamp) {
        return res.status(400).json({ error: 'You cannot log glucose levels for a future date or time.' });
    }

    next(); 
}


module.exports = {
    validateFoodItem,
    validateRecipe,
    validateGlucoseLog,
};
