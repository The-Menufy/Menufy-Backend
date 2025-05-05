const mongoose = require("mongoose");

const dishOfTheDaySchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    statut: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    productFK: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.DishOfTheDay ||
  mongoose.model("DishOfTheDay", dishOfTheDaySchema);
