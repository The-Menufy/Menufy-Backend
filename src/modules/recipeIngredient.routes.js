const express = require('express');
const router = express.Router();
const controller = require('./recipeIngredient.controller');

// Add ingredient to recipe
router.post('/', controller.addIngredientToRecipe);

// Get cost of a recipe
router.get('/cost/:recipeId', controller.getCostOfRecipe);
// Get cost of all recipes
router.get('/costs', controller.getAllRecipesCosts);


module.exports = router;
