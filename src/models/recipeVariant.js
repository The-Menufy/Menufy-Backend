const mongoose = require("mongoose");

const RecipeVariantSchema = new mongoose.Schema(
  {
    recipeBase: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Recipe", 
      required: false // Temporarily setting this to false since you mentioned you don't want it now
    },
    name: { 
      type: String, 
      required: true 
    },
    portions: [{ 
      type: String 
    }],

    note: String,
    images: [String], // Array of image URLs
  },
  { timestamps: true } // Add timestamps for createdAt and updatedAt
);

module.exports = mongoose.model("RecipeVariant", RecipeVariantSchema);
