const mongoose = require('mongoose');

const IngredientGroupSchema = new mongoose.Schema({
  title: { type: String, required: true }, // e.g., "Pour le biscuit"
  items: [
    {
      ingredient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ingredieent', // ⚠️ Kept typo as requested
        required: true
      },
      customQuantity: { type: String, required: true } // e.g., "150g", "2 cuillères à soupe"
    }
  ]
});

const StepSchema = new mongoose.Schema({
  title: String,
  description: { type: String, required: true }
});

const RecipeSchema = new mongoose.Schema({
  nom: { type: String, required: true, trim: true },
  temps_preparation: { type: Number, required: true, min: 0 },
  temps_cuisson: { type: Number, required: true, min: 0 },
  ingredientsGroup: [IngredientGroupSchema],
  utensils: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ustensile',
      required: true
    }
  ],
  decoration: [
    {
      name: { type: String, required: true },
      quantity: { type: String }
    }
  ],
  steps: [StepSchema],
  productFK: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  images: [{
    type: String, // Store image paths or URLs
    default: ''
  }], // ✅ Added field for up to 5 images
  video: { // ✅ Added field for video
    type: String, // Store video path or URL
    default: ''
  },
  variants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RecipeVariant',
      required: false 
    }
  ], 
}, {
  timestamps: true
});

module.exports = mongoose.models.Recipe || mongoose.model('Recipe', RecipeSchema);