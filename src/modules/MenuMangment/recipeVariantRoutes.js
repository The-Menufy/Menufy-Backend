/**
 * @swagger
 * tags:
 *   - name: RecipeVariant
 *     description: Gestion des variantes de recettes (modifications d'ingrédients, étapes, portions)
 *
 * components:
 *   schemas:
 *     RecipeVariant:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         portions:
 *           type: array
 *           items:
 *             type: object
 *         modifiedIngredientsGroup:
 *           type: array
 *           items:
 *             type: object
 *         modifiedSteps:
 *           type: array
 *           items:
 *             type: object
 *         note:
 *           type: string
 *         images:
 *           type: array
 *           items:
 *             type: string
 */

/**
 * @swagger
 * /api/recipe-variants:
 *   post:
 *     summary: Ajouter une variante de recette (avec photo)
 *     tags: [RecipeVariant]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               portions:
 *                 type: string
 *                 description: JSON.stringify d'un tableau de portions
 *               modifiedIngredientsGroup:
 *                 type: string
 *                 description: JSON.stringify d'un tableau d'ingrédients modifiés
 *               modifiedSteps:
 *                 type: string
 *                 description: JSON.stringify d'un tableau d'étapes modifiées
 *               note:
 *                 type: string
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Variante créée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RecipeVariant'
 *       400:
 *         description: Erreur de validation ou d'upload
 *   get:
 *     summary: Obtenir toutes les variantes de recette
 *     tags: [RecipeVariant]
 *     responses:
 *       200:
 *         description: Liste des variantes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RecipeVariant'
 *       500:
 *         description: Erreur serveur
 */

/**
 * @swagger
 * /api/recipe-variants/{id}:
 *   put:
 *     summary: Modifier une variante de recette (avec photo)
 *     tags: [RecipeVariant]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la variante
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               portions:
 *                 type: string
 *               modifiedIngredientsGroup:
 *                 type: string
 *               modifiedSteps:
 *                 type: string
 *               note:
 *                 type: string
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Variante modifiée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RecipeVariant'
 *       404:
 *         description: Variante non trouvée
 *       500:
 *         description: Erreur serveur
 *   delete:
 *     summary: Supprimer une variante de recette
 *     tags: [RecipeVariant]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la variante
 *     responses:
 *       200:
 *         description: Variante supprimée
 *       404:
 *         description: Variante non trouvée
 *       500:
 *         description: Erreur serveur
 */
const express = require("express");
const multer = require("multer");
const path = require("path");
const RecipeVariant = require("../../models/recipeVariant");
const router = express.Router();

console.log("recipeVariantRoutes loaded");

// Set up storage for images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// POST a new variant
router.post("/", upload.single("photo"), async (req, res) => {
  try {
    const { name, portions, modifiedIngredientsGroup, modifiedSteps, note } =
      req.body;

    const parsedPortions = portions ? JSON.parse(portions) : [];
    const parsedIngredientsGroup = modifiedIngredientsGroup
      ? JSON.parse(modifiedIngredientsGroup)
      : [];
    const parsedSteps = modifiedSteps ? JSON.parse(modifiedSteps) : [];
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const variant = new RecipeVariant({
      name,
      portions: parsedPortions,
      modifiedIngredientsGroup: Array.isArray(parsedIngredientsGroup)
        ? parsedIngredientsGroup
        : [],
      modifiedSteps: Array.isArray(parsedSteps) ? parsedSteps : [],
      note,
      images: image ? [image] : [],
    });

    const savedVariant = await variant.save();
    res.status(201).json(savedVariant);
  } catch (err) {
    console.error("Error during variant creation:", err);
    res.status(400).json({ error: err.message });
  }
});

// GET all variants
router.get("/", async (req, res) => {
  console.log("GET /api/recipe-variants called");
  try {
    const variants = await RecipeVariant.find();
    console.log("Fetched variants:", variants);
    res.status(200).json(variants);
  } catch (error) {
    console.error("Error fetching variants:", error);
    res.status(500).json({ error: "Failed to fetch variants" });
  }
});

// DELETE a variant
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedVariant = await RecipeVariant.findByIdAndDelete(id);
    if (!deletedVariant) {
      return res.status(404).json({ error: "Variant not found" });
    }
    res.status(200).json({ message: "Variant deleted successfully" });
  } catch (error) {
    console.error("Error deleting variant:", error);
    res.status(500).json({ error: "Failed to delete variant" });
  }
});

// PUT to update a variant
router.put("/:id", upload.single("photo"), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, portions, modifiedIngredientsGroup, modifiedSteps, note } =
      req.body;

    const parsedPortions = portions ? JSON.parse(portions) : [];
    const parsedIngredientsGroup = modifiedIngredientsGroup
      ? JSON.parse(modifiedIngredientsGroup)
      : [];
    const parsedSteps = modifiedSteps ? JSON.parse(modifiedSteps) : [];

    const updateData = {
      name,
      portions: parsedPortions,
      modifiedIngredientsGroup: Array.isArray(parsedIngredientsGroup)
        ? parsedIngredientsGroup
        : [],
      modifiedSteps: Array.isArray(parsedSteps) ? parsedSteps : [],
      note,
    };

    // If a new image is uploaded, update the images array
    if (req.file) {
      updateData.images = [`/uploads/${req.file.filename}`];
    }

    const updatedVariant = await RecipeVariant.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedVariant) {
      return res.status(404).json({ error: "Variant not found" });
    }

    res.status(200).json(updatedVariant);
  } catch (error) {
    console.error("Error updating variant:", error);
    res.status(500).json({ error: "Failed to update variant" });
  }
});

module.exports = router;
