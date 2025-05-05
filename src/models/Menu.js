const mongoose = require('mongoose');

const MenuSchema = new mongoose.Schema({
  name: String,
  photo: String,
  visibility: String,
  rate: String,
  archived: {
    type: Boolean,
    default: false, // Automatically set to "not archived" for new menus
  },
});

module.exports = mongoose.model('Menu', MenuSchema);
