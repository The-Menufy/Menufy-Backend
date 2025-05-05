const mongoose = require("mongoose");
const { Schema } = mongoose;

const ingredientSchema = new Schema(
  {
    libelle: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    disponibility: {
      type: Boolean,
      default: true,
    },
    maxQty: {
      type: Number,
      required: true,
      min: 0,
    },
    minQty: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// Index libelle for faster lookups
ingredientSchema.index({ libelle: 1 });

module.exports = mongoose.model("Ingredient", ingredientSchema);