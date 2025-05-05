/**
 * @swagger
 * tags:
 *   - name: Ingredient
 *     description: Gestion des ingrédients
 *
 * components:
 *   schemas:
 *     Ingredient:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         libelle:
 *           type: string
 *         quantity:
 *           type: number
 *         type:
 *           type: string
 *         price:
 *           type: number
 *         disponibility:
 *           type: boolean
 *         qtMax:
 *           type: number
 *         photo:
 *           type: string
 *         archived:
 *           type: boolean
 */

/**
 * @swagger
 * /ingredient:
 *   post:
 *     summary: Ajouter un ingrédient (avec upload d'image)
 *     tags: [Ingredient]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               libelle:
 *                 type: string
 *               quantity:
 *                 type: number
 *               type:
 *                 type: string
 *               price:
 *                 type: number
 *               disponibility:
 *                 type: boolean
 *               qtMax:
 *                 type: number
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Ingrédient ajouté
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ingredient'
 *       400:
 *         description: Erreur de validation ou d'upload
 *   get:
 *     summary: Obtenir tous les ingrédients
 *     tags: [Ingredient]
 *     responses:
 *       200:
 *         description: Liste des ingrédients
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Ingredient'
 *       400:
 *         description: Erreur serveur
 */

/**
 * @swagger
 * /ingredient/{id}:
 *   get:
 *     summary: Obtenir un ingrédient par son ID
 *     tags: [Ingredient]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'ingrédient
 *     responses:
 *       200:
 *         description: Ingrédient trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ingredient'
 *       404:
 *         description: Ingrédient non trouvé
 *   put:
 *     summary: Modifier un ingrédient (avec upload d'image)
 *     tags: [Ingredient]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'ingrédient
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               libelle:
 *                 type: string
 *               quantity:
 *                 type: number
 *               type:
 *                 type: string
 *               price:
 *                 type: number
 *               disponibility:
 *                 type: boolean
 *               qtMax:
 *                 type: number
 *               archived:
 *                 type: boolean
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Ingrédient modifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ingredient'
 *       404:
 *         description: Ingrédient non trouvé
 *       400:
 *         description: Erreur de validation ou d'upload
 *   delete:
 *     summary: Supprimer un ingrédient
 *     tags: [Ingredient]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'ingrédient
 *     responses:
 *       200:
 *         description: Ingrédient supprimé
 *       404:
 *         description: Ingrédient non trouvé
 *       400:
 *         description: Erreur serveur
 */

/**
 * @swagger
 * /ingredient/{id}/archive:
 *   put:
 *     summary: Archiver un ingrédient
 *     tags: [Ingredient]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'ingrédient
 *     responses:
 *       200:
 *         description: Ingrédient archivé
 *       404:
 *         description: Ingrédient non trouvé
 *       500:
 *         description: Erreur serveur
 *
 * /ingredient/{id}/restore:
 *   put:
 *     summary: Restaurer un ingrédient archivé
 *     tags: [Ingredient]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'ingrédient
 *     responses:
 *       200:
 *         description: Ingrédient restauré
 *       404:
 *         description: Ingrédient non trouvé
 *       500:
 *         description: Erreur serveur
 */
const express = require("express");
const router = express.Router();
const Ingredieent = require("../../models/Ingredieent");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure multer storage
const uploadDir = path.join(__dirname, "../../Uploads/ingredients");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb("Error: Images only (jpeg, jpg, png)!");
  },
}).single("photo");

// Create new ingredient with image upload
router.post("/", upload, async (req, res) => {
  try {
    const ingredientData = {
      libelle: req.body.libelle,
      quantity: parseFloat(req.body.quantity),
      type: req.body.type,
      price: parseFloat(req.body.price),
      disponibility: req.body.disponibility === "true",
      qtMax: parseFloat(req.body.qtMax),
      photo: req.file ? `/Uploads/ingredients/${req.file.filename}` : null,
      archived: false, // Ensure new ingredients are not archived
    };
    const ingredient = new Ingredieent(ingredientData);
    res.json(await ingredient.save());
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all ingredients
router.get("/", async (req, res) => {
  try {
    res.json(await Ingredieent.find());
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get single ingredient
router.get("/:id", async (req, res) => {
  try {
    const ingredient = await Ingredieent.findById(req.params.id);
    if (!ingredient)
      return res.status(404).json({ error: "Ingredient not found" });
    res.json(ingredient);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update ingredient (with optional image upload)
router.put("/:id", upload, async (req, res) => {
  try {
    const updateData = {
      libelle: req.body.libelle,
      quantity: parseFloat(req.body.quantity),
      type: req.body.type,
      price: parseFloat(req.body.price),
      disponibility: req.body.disponibility === "true",
      qtMax: parseFloat(req.body.qtMax),
      archived: req.body.archived ? req.body.archived === "true" : undefined,
    };

    if (req.file) {
      const existingIngredient = await Ingredieent.findById(req.params.id);
      if (existingIngredient && existingIngredient.photo) {
        const oldPhotoPath = path.join(
          __dirname,
          "../../",
          existingIngredient.photo
        );
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }
      updateData.photo = `/Uploads/ingredients/${req.file.filename}`;
    }

    const ingredient = await Ingredieent.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (!ingredient)
      return res.status(404).json({ error: "Ingredient not found" });
    res.json(ingredient);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete ingredient
router.delete("/:id", async (req, res) => {
  try {
    const ingredient = await Ingredieent.findById(req.params.id);
    if (!ingredient)
      return res.status(404).json({ error: "Ingredient not found" });

    if (ingredient.photo) {
      const photoPath = path.join(__dirname, "../../", ingredient.photo);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }

    await Ingredieent.findByIdAndDelete(req.params.id);
    res.json({ message: "Ingredient deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Archive ingredient
router.put("/:id/archive", async (req, res) => {
  try {
    const ingredient = await Ingredieent.findById(req.params.id);
    if (!ingredient) {
      return res.status(404).json({ error: "Ingredient not found" });
    }

    if (ingredient.archived) {
      return res.status(400).json({ error: "Ingredient is already archived" });
    }

    const updatedIngredient = await Ingredieent.findByIdAndUpdate(
      req.params.id,
      { archived: true },
      { new: true }
    );

    res.json({
      message: "Ingredient archived successfully",
      ingredient: updatedIngredient,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Restore ingredient
router.put("/:id/restore", async (req, res) => {
  try {
    const ingredient = await Ingredieent.findById(req.params.id);
    if (!ingredient) {
      return res.status(404).json({ error: "Ingredient not found" });
    }

    if (!ingredient.archived) {
      return res.status(400).json({ error: "Ingredient is not archived" });
    }

    const updatedIngredient = await Ingredieent.findByIdAndUpdate(
      req.params.id,
      { archived: false },
      { new: true }
    );

    res.json({
      message: "Ingredient restored successfully",
      ingredient: updatedIngredient,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
