const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const { validateRecipe } = require('../middleware/validationMiddleware');


router.get('/recipes', recipeController.getAllRecipes);                       
router.get('/recipes/:id', recipeController.getRecipeById);                  
router.get('/recipes/search/name', recipeController.getRecipeByName);        
router.post('/recipes', validateRecipe, recipeController.createRecipe);      
router.put('/recipes/:id', validateRecipe, recipeController.updateRecipe);    
router.delete('/recipes/:id', recipeController.deleteRecipe);                 
router.post('/recipes/log', recipeController.logRecipe);
router.get('/recipes/logs/:user_id', recipeController.getRecipeLogs);
router.delete('/logs/:id', recipeController.deleteRecipeLog);

module.exports = router;