const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: String,
  price: Number,
  description: String,
  promotion: String,
  disponibility: String,
  duration: String,
  photo: String,
  archived: {
    type: Boolean,
    default: false,
  },
  typePlat: {
    type: String,
    enum: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'non-vegetarian'],
    default: 'non-vegetarian',
  },
  categoryFK: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  recipeFK: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' },
});

module.exports = mongoose.model('Product', ProductSchema);