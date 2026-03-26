const express = require('express');
const router = express.Router();
const mealController = require('../controllers/mealController');


router.post('/createMeal', mealController.createMeal);


router.get('/getMealBy/:id', mealController.getMealById);


router.post('/getAllMealsFor/user', mealController.getMealsByUser);


router.put('/:id/recalculate', mealController.updateMealNutrition);


router.delete('/deleteMeal/:id', mealController.deleteMeal);


router.put('/updateMeal/:id', mealController.updateMeal);

module.exports = router;
