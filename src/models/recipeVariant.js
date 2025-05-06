const mongoose = require("mongoose");

const RecipeVariantSchema = new mongoose.Schema(
  {
    recipeBase: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Recipe", 
      required: false 
    },
    name: { 
      type: String, 
      required: true 
    },
    portions: [{ 
      type: String,
      enum: {
        values: ['half-portion', 'medium-portion', 'double-portion'],
        message: '{VALUE} is not a valid portion type. Must be one of: half-portion, medium-portion, double-portion'
      },
      required: true 
    }],
    note: String,
    images: [String],
    isArchived: { 
      type: Boolean, 
      default: false 
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RecipeVariant", RecipeVariantSchema);