const mongoose = require('mongoose');

const RecipeIngredientSchema = new mongoose.Schema({
  recipe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe',
    required: true
  },
  ingredient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ingredient',
    required: true
  },
  quantityUsed: {
    type: Number, // Example: 0.25 (kg, liter, etc.)
    required: true
  },
  unit: {
    type: String,
    default: "kg" // Optional: could be g, ml, etc.
  }
});

module.exports = mongoose.model('RecipeIngredient', RecipeIngredientSchema);
