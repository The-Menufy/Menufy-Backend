/**
 * @swagger
 * tags:
 *   - name: DishOfTheDay
 *     description: Gestion du plat du jour
 *
 * components:
 *   schemas:
 *     DishOfTheDay:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         date:
 *           type: string
 *           format: date
 *         statut:
 *           type: string
 *           example: "Active"
 *         productFK:
 *           $ref: '#/components/schemas/Product'
 *     Product:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         price:
 *           type: number
 *         categoryFK:
 *           type: string
 *         recipeFK:
 *           type: string
 *         # ... add more fields as needed
 */

/**
 * @swagger
 * /dish:
 *   post:
 *     summary: Ajouter un plat du jour
 *     tags: [DishOfTheDay]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - productFK
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2024-05-04"
 *               statut:
 *                 type: string
 *                 example: "Active"
 *               productFK:
 *                 type: string
 *                 description: ID du produit lié
 *     responses:
 *       201:
 *         description: Plat du jour créé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DishOfTheDay'
 *       400:
 *         description: Données invalides ou produit inexistant
 */

/**
 * @swagger
 * /dish:
 *   get:
 *     summary: Obtenir tous les plats du jour
 *     tags: [DishOfTheDay]
 *     responses:
 *       200:
 *         description: Liste des plats du jour
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DishOfTheDay'
 *       500:
 *         description: Erreur serveur
 */

/**
 * @swagger
 * /dish/{id}:
 *   put:
 *     summary: Modifier un plat du jour
 *     tags: [DishOfTheDay]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID du plat du jour
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               statut:
 *                 type: string
 *               productFK:
 *                 type: string
 *     responses:
 *       200:
 *         description: Plat du jour modifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DishOfTheDay'
 *       404:
 *         description: Plat du jour non trouvé
 *       500:
 *         description: Erreur serveur
 *   delete:
 *     summary: Supprimer un plat du jour
 *     tags: [DishOfTheDay]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID du plat du jour
 *     responses:
 *       200:
 *         description: Plat du jour supprimé
 *       404:
 *         description: Plat du jour non trouvé
 *       500:
 *         description: Erreur serveur
 */
const express = require("express");
const router = express.Router();
const DishOfTheDay = require("../../models/DishOfTheDay");
const Product = require("../../models/Product");

// POST a new Dish of the Day
router.post("/", async (req, res) => {
  try {
    const { date, statut, productFK } = req.body;

    if (!date || !productFK) {
      return res
        .status(400)
        .json({ message: "Date and productFK are required" });
    }

    const product = await Product.findById(productFK);
    if (!product) {
      return res.status(400).json({ message: "Product not found" });
    }

    const newDish = new DishOfTheDay({
      date,
      statut: statut || "Active",
      productFK,
    });

    const savedDish = await newDish.save();

    const populatedDish = await DishOfTheDay.findById(savedDish._id).populate({
      path: "productFK",
      populate: [
        { path: "categoryFK", select: "libelle" },
        {
          path: "recipeFK",
          populate: [
            {
              path: "ingredientsGroup.items.ingredient",
              select: "libelle photo qtMax",
            },
            {
              path: "utensils",
              select: "libelle quantity disponibility photo",
            },
            { path: "variants", select: "name portions images" },
          ],
        },
      ],
    });

    res.status(201).json(populatedDish);
  } catch (error) {
    console.error("Error creating Dish of the Day:", error);
    res.status(400).json({
      message: "Error creating Dish of the Day",
      error: error.message,
    });
  }
});

// GET all Dishes of the Day
router.get("/", async (req, res) => {
  try {
    const dishes = await DishOfTheDay.find()
      .populate({
        path: "productFK",
        populate: [
          { path: "categoryFK", select: "libelle" },
          {
            path: "recipeFK",
            populate: [
              {
                path: "ingredientsGroup.items.ingredient",
                select: "libelle photo qtMax",
              },
              {
                path: "utensils",
                select: "libelle quantity disponibility photo",
              },
              { path: "variants", select: "name portions images" },
            ],
          },
        ],
      })
      .sort({ date: -1 });

    res.status(200).json(dishes);
  } catch (error) {
    console.error("Error fetching Dishes of the Day:", error);
    res.status(500).json({
      message: "Error fetching Dishes of the Day",
      error: error.message,
    });
  }
});

// PUT /dish/:id
router.put("/:id", async (req, res) => {
  try {
    const { date, statut, productFK } = req.body;

    const updateData = {};
    if (date) updateData.date = date;
    if (statut) updateData.statut = statut;
    if (productFK) {
      const product = await Product.findById(productFK);
      if (!product) {
        return res.status(400).json({ message: "Product not found" });
      }
      updateData.productFK = productFK;
    }

    const updatedDish = await DishOfTheDay.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    ).populate({
      path: "productFK",
      populate: [
        { path: "categoryFK", select: "libelle" },
        {
          path: "recipeFK",
          populate: [
            {
              path: "ingredientsGroup.items.ingredient",
              select: "libelle photo qtMax",
            },
            {
              path: "utensils",
              select: "libelle quantity disponibility photo",
            },
            { path: "variants", select: "name portions images" },
          ],
        },
      ],
    });

    if (!updatedDish) {
      return res.status(404).json({ message: "Dish of the Day not found" });
    }

    res.status(200).json(updatedDish);
  } catch (error) {
    console.error("Error updating Dish of the Day:", error);
    res.status(500).json({
      message: "Error updating Dish of the Day",
      error: error.message,
    });
  }
});

// DELETE a Dish of the Day
router.delete("/:id", async (req, res) => {
  try {
    const dish = await DishOfTheDay.findByIdAndDelete(req.params.id);
    if (!dish) {
      return res.status(404).json({ message: "Dish of the Day not found" });
    }

    res.status(200).json({ message: "Dish of the Day deleted successfully" });
  } catch (error) {
    console.error("Error deleting Dish of the Day:", error);
    res.status(500).json({
      message: "Error deleting Dish of the Day",
      error: error.message,
    });
  }
});

module.exports = router;
