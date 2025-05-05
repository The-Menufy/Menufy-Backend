const express = require("express");
const axios = require("axios");
const router = express.Router();

const NUTRITIONIX_APP_ID = process.env.NUTRITIONIX_APP_ID;
const NUTRITIONIX_API_KEY = process.env.NUTRITIONIX_API_KEY;

router.post("/analyze", async (req, res) => {
  const ingredients = req.body.ingredients;

  if (!ingredients || !Array.isArray(ingredients)) {
    return res.status(400).json({ message: "Invalid ingredients list" });
  }

  try {
    const results = await Promise.all(
      ingredients.map(async (item) => {
        const response = await axios.post(
          "https://trackapi.nutritionix.com/v2/natural/nutrients",
          { query: item },
          {
            headers: {
              "x-app-id": NUTRITIONIX_APP_ID,
              "x-app-key": NUTRITIONIX_API_KEY,
              "Content-Type": "application/json"
            }
          }
        );
        return response.data.foods[0];
      })
    );

    const totals = results.reduce(
      (acc, food) => {
        acc.calories += food.nf_calories || 0;
        acc.protein += food.nf_protein || 0;
        acc.fat += food.nf_total_fat || 0;
        acc.carbs += food.nf_total_carbohydrate || 0;
        return acc;
      },
      { calories: 0, protein: 0, fat: 0, carbs: 0 }
    );

    res.json({
      ...totals,
      tags: generateTags(totals),
    });
  } catch (error) {
    console.error("❌ Nutrition analysis failed:", error.message);
    res.status(500).json({ message: "Failed to analyze nutrition" });
  }
});

function generateTags({ calories, protein, carbs }) {
  const tags = [];
  if (calories < 400) tags.push("Low Calorie");
  if (protein > 15) tags.push("High Protein");
  if (carbs < 15) tags.push("Low Carb");
  return tags;
}

module.exports = router;
