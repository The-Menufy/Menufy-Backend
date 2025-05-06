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
 *       required:
 *         - name
 *         - portions
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the variant
 *         name:
 *           type: string
 *           description: Name of the recipe variant
 *         portions:
 *           type: array
 *           items:
 *             type: string
 *             enum: [half-portion, medium-portion, double-portion]
 *           description: List of portion types for the variant
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of image URLs for the variant
 *         isArchived:
 *           type: boolean
 *           description: Indicates if the variant is archived
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
 *             required:
 *               - name
 *               - portions
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the recipe variant
 *               portions:
 *                 type: string
 *                 description: Comma-separated list of portion types (e.g., half-portion,medium-portion,double-portion)
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Image file for the variant
 *     responses:
 *       201:
 *         description: Variante créée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RecipeVariant'
 *       400:
 *         description: Erreur de validation ou d'upload
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
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
 *             required:
 *               - name
 *               - portions
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the recipe variant
 *               portions:
 *                 type: string
 *                 description: Comma-separated list of portion types (e.g., half-portion,medium-portion,double-portion)
  *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Image file for the variant
 *     responses:
 *       200:
 *         description: Variante modifiée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RecipeVariant'
 *       404:
 *         description: Variante non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Variante non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *   /archive:
 *     put:
 *       summary: Archiver une variante de recette
 *       tags: [RecipeVariant]
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: string
 *           description: ID de la variante
 *       responses:
 *         200:
 *           description: Variante archivée
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/RecipeVariant'
 *         404:
 *           description: Variante non trouvée
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   error:
 *                     type: string
 *         500:
 *           description: Erreur serveur
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   error:
 *                     type: string
 *   /restore:
 *     put:
 *       summary: Restaurer une variante de recette
 *       tags: [RecipeVariant]
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: string
 *           description: ID de la variante
 *       responses:
 *         200:
 *           description: Variante restaurée
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/RecipeVariant'
 *         404:
 *           description: Variante non trouvée
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   error:
 *                     type: string
 *         500:
 *           description: Erreur serveur
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   error:
 *                     type: string
 */

// POST a new variant
router.post("/", upload.single("photo"), async (req, res) => {
  try {
    const { name, portions, modifiedIngredientsGroup, modifiedSteps, note } = req.body;

    // Validate required fields
    if (!name || !portions) {
      return res.status(400).json({ error: "Name and portions are required" });
    }

    // Parse portions as a comma-separated string
    const parsedPortions = portions.split(',').map(p => p.trim()).filter(p => p);
    if (parsedPortions.length === 0) {
      return res.status(400).json({ error: "Portions must be a non-empty list" });
    }
    const validPortions = ['half-portion', 'medium-portion', 'double-portion'];
    const invalidPortions = parsedPortions.filter(p => !validPortions.includes(p));
    if (invalidPortions.length > 0) {
      return res.status(400).json({
        error: `Invalid portion types: ${invalidPortions.join(', ')}. Must be one of: half-portion, medium-portion, double-portion`
      });
    }

    // Parse other fields (still JSON for now, can be updated similarly if needed)
    const parsedIngredientsGroup = modifiedIngredientsGroup ? JSON.parse(modifiedIngredientsGroup) : [];
    const parsedSteps = modifiedSteps ? JSON.parse(modifiedSteps) : [];
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const variant = new RecipeVariant({
      name,
      portions: parsedPortions,
      modifiedIngredientsGroup: Array.isArray(parsedIngredientsGroup) ? parsedIngredientsGroup : [],
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
    const { name, portions, modifiedIngredientsGroup, modifiedSteps, note } = req.body;

    // Validate required fields
    if (!name || !portions) {
      return res.status(400).json({ error: "Name and portions are required" });
    }

    // Parse portions as a comma-separated string
    const parsedPortions = portions.split(',').map(p => p.trim()).filter(p => p);
    if (parsedPortions.length === 0) {
      return res.status(400).json({ error: "Portions must be a non-empty list" });
    }
    const validPortions = ['half-portion', 'medium-portion', 'double-portion'];
    const invalidPortions = parsedPortions.filter(p => !validPortions.includes(p));
    if (invalidPortions.length > 0) {
      return res.status(400).json({
        error: `Invalid portion types: ${invalidPortions.join(', ')}. Must be one of: half-portion, medium-portion, double-portion`
      });
    }

    const parsedIngredientsGroup = modifiedIngredientsGroup ? JSON.parse(modifiedIngredientsGroup) : [];
    const parsedSteps = modifiedSteps ? JSON.parse(modifiedSteps) : [];

    const updateData = {
      name,
      portions: parsedPortions,
      modifiedIngredientsGroup: Array.isArray(parsedIngredientsGroup) ? parsedIngredientsGroup : [],
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

// Archive a variant
router.put("/:id/archive", async (req, res) => {
  try {
    const { id } = req.params;
    const variant = await RecipeVariant.findById(id);
    if (!variant) {
      return res.status(404).json({ error: "Variant not found" });
    }
    variant.isArchived = true;
    const updatedVariant = await variant.save();
    res.status(200).json(updatedVariant);
  } catch (error) {
    console.error("Error archiving variant:", error);
    res.status(500).json({ error: "Failed to archive variant" });
  }
});

// Restore a variant
router.put("/:id/restore", async (req, res) => {
  try {
    const { id } = req.params;
    const variant = await RecipeVariant.findById(id);
    if (!variant) {
      return res.status(404).json({ error: "Variant not found" });
    }
    variant.isArchived = false;
    const updatedVariant = await variant.save();
    res.status(200).json(updatedVariant);
  } catch (error) {
    console.error("Error restoring variant:", error);
    res.status(500).json({ error: "Failed to restore variant" });
  }
});

module.exports = router;