const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  libelle: String,
  description: String,
  photo: String,
  visibility: String,
  menu: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu' }
});

module.exports = mongoose.model('Category', CategorySchema);
