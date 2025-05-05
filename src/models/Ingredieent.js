const mongoose = require('mongoose');

const IngredientSchema = new mongoose.Schema({
  libelle: String,
  quantity: Number,
  type: String,
  price: Number,
  disponibility: Boolean,
  qtMax: Number,
  photo: String,
  archived: {
    type: Boolean,
    default: false, // Automatically set to "not archived" for new ingredients
  },
});

module.exports = mongoose.model('Ingredieent', IngredientSchema);