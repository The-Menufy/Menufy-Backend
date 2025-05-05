const mongoose = require('mongoose');

const RecipeIngredient = require('../models/RecipeIngredient');
const Ingredient = require('../models/ingredient');

// ✅ Add a new ingredient to a recipe
exports.addIngredientToRecipe = async (req, res) => {
  try {
    const { recipeId, ingredientId, quantityUsed, unit } = req.body;

    if (!recipeId || !ingredientId || !quantityUsed) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const ingredient = await Ingredient.findById(ingredientId);
    if (!ingredient) {
      return res.status(404).json({ error: "Ingredient not found." });
    }

    const entry = await RecipeIngredient.create({
      recipe: recipeId,
      ingredient: ingredientId,
      quantityUsed,
      unit
    });

    res.status(201).json(entry);
  } catch (err) {
    console.error("❌ Error adding ingredient to recipe:", err.message);
    res.status(500).json({ error: "Server error while adding ingredient." });
  }
};

// ✅ Get total cost of a single recipe
exports.getCostOfRecipe = async (req, res) => {
  try {
    const { recipeId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(recipeId)) {
      return res.status(400).json({ error: "Invalid recipe ID format." });
    }

    const items = await RecipeIngredient.find({
      recipe: new mongoose.Types.ObjectId(recipeId)
    }).populate('ingredient');

    let totalCost = 0;
    const validItems = [];

    items.forEach(item => {
      if (item.ingredient) {
        const cost = item.quantityUsed * item.ingredient.price;
        totalCost += cost;
        validItems.push(item);
      }
    });

    res.json({
      totalCost: totalCost.toFixed(2),
      ingredients: validItems
    });
  } catch (err) {
    console.error("❌ Error calculating cost of recipe:", err.message);
    res.status(500).json({ error: "Server error while calculating recipe cost." });
  }
};

// ✅ Get cost of ALL recipes with ingredient breakdown
exports.getAllRecipesCosts = async (req, res) => {
  try {
    const Recipe = require('../models/recipe');
    const recipes = await Recipe.find().populate('productFK');

    const results = [];

    for (const recipe of recipes) {
      const items = await RecipeIngredient.find({ recipe: recipe._id }).populate('ingredient');

      let totalCost = 0;
      const details = [];

      for (const item of items) {
        if (item.ingredient) {
          const cost = item.quantityUsed * item.ingredient.price;
          totalCost += cost;

          details.push({
            ingredientName: item.ingredient.libelle,
            quantityUsed: item.quantityUsed,
            unit: item.unit,
            unitPrice: item.ingredient.price,
            partialCost: cost.toFixed(2)
          });
        }
      }

      results.push({
        recipeId: recipe._id,
        recipeName: recipe.nom,
        totalCost: totalCost.toFixed(2),
        sellingPrice: recipe.productFK?.price || null,  // <- NEW
        profit: recipe.productFK?.price ? (recipe.productFK.price - totalCost).toFixed(2) : null, // <- NEW
        ingredients: details
      });
      
    }

    res.status(200).json({ success: true, data: results });
  } catch (err) {
    console.error("❌ Error fetching all recipe costs:", err.message);
    res.status(500).json({ success: false, message: "Server error while fetching costs." });
  }
};
