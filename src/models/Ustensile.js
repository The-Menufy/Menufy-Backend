const mongoose = require('mongoose');

const UstensileSchema = new mongoose.Schema({
  libelle: String,
  quantity: Number,
  disponibility: Boolean,
  photo: String,
  archived: {
    type: Boolean,
    default: false, // Automatically set to "not archived" for new ingredients
  },
});

module.exports = mongoose.model('Ustensile', UstensileSchema);