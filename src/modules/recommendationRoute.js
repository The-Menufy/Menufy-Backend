const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const natural = require('natural');

const tokenizer = new natural.WordTokenizer();
const tfidf = new natural.TfIdf();

// Charger le dataset mealData.json
const dataPath = path.join(__dirname, '../../data/mealData.json');
const meals = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// Ajouter les ingrédients comme documents pour TF-IDF
meals.forEach(meal => {
  const doc = meal.ingredients.join(' ').toLowerCase();
  tfidf.addDocument(tokenizer.tokenize(doc));
});

// Route POST /api/recommendation
router.post('/', (req, res) => {
  const { ingredients } = req.body;

  if (!Array.isArray(ingredients)) {
    return res.status(400).json({ message: 'ingredients must be an array' });
  }

  const queryTokens = tokenizer.tokenize(ingredients.join(' ').toLowerCase());

  // Calcul du score TF-IDF total pour chaque plat
  const results = meals.map((meal, index) => {
    let score = 0;
    queryTokens.forEach(token => {
      score += tfidf.tfidf(token, index); // Score TF-IDF pour chaque ingrédient/token
    });

    return {
      name: meal.name,
      ingredients: meal.ingredients,
      mealTime: meal.mealTime,
      score: score
    };
  });

  // Supprimer doublons et trier par score
  const seen = new Set();
  const topResults = results
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .filter(r => {
      if (seen.has(r.name)) return false;
      seen.add(r.name);
      return true;
    })
    .slice(0, 3);

  if (topResults.length === 0) {
    return res.status(404).json({ message: 'No matching dishes found.' });
  }

  res.json(topResults);
});

module.exports = router;
