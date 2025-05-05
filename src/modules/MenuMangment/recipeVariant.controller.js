const express = require("express");
const multer = require('multer');
const path = require('path');
const RecipeVariant = require('../../models/recipeVariant');
const router = express.Router();

// Set up storage for images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Store files in 'uploads/' directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Rename file with timestamp
  }
});

const upload = multer({ storage: storage });

router.post("/", upload.single('photo'), async (req, res) => {
  try {
    const { name, portions, modifiedIngredientsGroup, modifiedSteps, note } = req.body;

    const parsedPortions = portions ? JSON.parse(portions) : [];

    const image = req.file ? `/uploads/${req.file.filename}` : null;  

    const variant = new RecipeVariant({
      name,
      portions: parsedPortions,
      modifiedIngredientsGroup,
      modifiedSteps,
      note,
      images: image ? [image] : [],  
    });

    const savedVariant = await variant.save();
    res.status(201).json(savedVariant); 
  } catch (err) {
    console.error('Error during variant creation:', err); 
    res.status(400).json({ error: err.message });
  }
});


module.exports = router;
