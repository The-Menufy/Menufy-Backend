const express = require("express");
const router = express.Router();
const Ingredient = require("../../models/Ingredieent");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure multer storage
const uploadDir = path.join(__dirname, "../../uploads/ingredients");
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

/**
 * @swagger
 * tags:
 *   - name: Ingredient
 *     description: Operations for managing ingredients
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Ingredient:
 *       type: object
 *       required:
 *         - libelle
 *         - quantity
 *         - type
 *         - price
 *         - disponibility
 *         - qtMax
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the ingredient
 *         libelle:
 *           type: string
 *           description: Name of the ingredient
 *         quantity:
 *           type: number
 *           description: Current quantity of the ingredient
 *         type:
 *           type: string
 *           description: Type or category of the ingredient
 *         price:
 *           type: number
 *           description: Price of the ingredient
 *         disponibility:
 *           type: boolean
 *           description: Availability status of the ingredient
 *         qtMax:
 *           type: number
 *           description: Maximum quantity allowed for the ingredient
 *         photo:
 *           type: string
 *           description: Path to the uploaded ingredient image
 *         archived:
 *           type: boolean
 *           description: Indicates if the ingredient is archived
 *     Error:
 *       type: object
 *       required:
 *         - error
 *       properties:
 *         error:
 *           type: string
 *           description: Error message describing the issue
 */

/**
 * @swagger
 * /ingredient:
 *   post:
 *     summary: Create a new ingredient with optional image upload
 *     tags: [Ingredient]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - libelle
 *               - quantity
 *               - type
 *               - price
 *               - disponibility
 *               - qtMax
 *             properties:
 *               libelle:
 *                 type: string
 *                 description: Name of the ingredient
 *               quantity:
 *                 type: number
 *                 description: Current quantity of the ingredient
 *               type:
 *                 type: string
 *                 description: Type or category of the ingredient
 *               price:
 *                 type: number
 *                 description: Price of the ingredient
 *               disponibility:
 *                 type: boolean
 *                 description: Availability status of the ingredient
 *               qtMax:
 *                 type: number
 *                 description: Maximum quantity allowed for the ingredient
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Ingredient image file (jpeg, jpg, png; max 5MB)
 *     responses:
 *       201:
 *         description: Ingredient created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ingredient'
 *       400:
 *         description: Validation error or invalid image upload
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/", upload, async (req, res) => {
  try {
    // Validate required fields
    const { libelle, quantity, type, price, disponibility, qtMax } = req.body;
    if (!libelle || quantity === undefined || !type || price === undefined || disponibility === undefined || qtMax === undefined) {
      return res.status(400).json({ error: "Libelle, quantity, type, price, disponibility, and qtMax are required" });
    }

    const ingredientData = {
      libelle,
      quantity: parseFloat(quantity),
      type,
      price: parseFloat(price),
      disponibility: disponibility === "true",
      qtMax: parseFloat(qtMax),
      photo: req.file ? `/Uploads/ingredients/${req.file.filename}` : null,
      archived: false,
    };
    const ingredient = new Ingredient(ingredientData);
    const savedIngredient = await ingredient.save();
    res.status(201).json(savedIngredient);
  } catch (error) {
    console.error("Error creating ingredient:", error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /ingredient:
 *   get:
 *     summary: Retrieve all ingredients
 *     tags: [Ingredient]
 *     responses:
 *       200:
 *         description: List of all ingredients
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Ingredient'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", async (req, res) => {
  try {
    const ingredients = await Ingredient.find();
    res.json(ingredients);
  } catch (error) {
    console.error("Error fetching ingredients:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /ingredient/{id}:
 *   get:
 *     summary: Retrieve an ingredient by ID
 *     tags: [Ingredient]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier of the ingredient
 *     responses:
 *       200:
 *         description: Ingredient retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ingredient'
 *       404:
 *         description: Ingredient not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:id", async (req, res) => {
  try {
    const ingredient = await Ingredient.findById(req.params.id);
    if (!ingredient) {
      return res.status(404).json({ error: "Ingredient not found" });
    }
    res.json(ingredient);
  } catch (error) {
    console.error("Error fetching ingredient:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /ingredient/{id}:
 *   put:
 *     summary: Update an ingredient with optional image upload
 *     tags: [Ingredient]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier of the ingredient
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - libelle
 *               - quantity
 *               - type
 *               - price
 *               - disponibility
 *               - qtMax
 *             properties:
 *               libelle:
 *                 type: string
 *                 description: Name of the ingredient
 *               quantity:
 *                 type: number
 *                 description: Current quantity of the ingredient
 *               type:
 *                 type: string
 *                 description: Type or category of the ingredient
 *               price:
 *                 type: number
 *                 description: Price of the ingredient
 *               disponibility:
 *                 type: boolean
 *                 description: Availability status of the ingredient
 *               qtMax:
 *                 type: number
 *                 description: Maximum quantity allowed for the ingredient
 *               archived:
 *                 type: boolean
 *                 description: Archive status of the ingredient
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Ingredient image file (jpeg, jpg, png; max 5MB)
 *     responses:
 *       200:
 *         description: Ingredient updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ingredient'
 *       400:
 *         description: Validation error or invalid image upload
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Ingredient not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put("/:id", upload, async (req, res) => {
  try {
    // Validate required fields
    const { libelle, quantity, type, price, disponibility, qtMax } = req.body;
    if (!libelle || quantity === undefined || !type || price === undefined || disponibility === undefined || qtMax === undefined) {
      return res.status(400).json({ error: "Libelle, quantity, type, price, disponibility, and qtMax are required" });
    }

    const updateData = {
      libelle,
      quantity: parseFloat(quantity),
      type,
      price: parseFloat(price),
      disponibility: disponibility === "true",
      qtMax: parseFloat(qtMax),
      archived: req.body.archived ? req.body.archived === "true" : undefined,
    };

    if (req.file) {
      const existingIngredient = await Ingredient.findById(req.params.id);
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

    const ingredient = await Ingredient.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (!ingredient) {
      return res.status(404).json({ error: "Ingredient not found" });
    }
    res.json(ingredient);
  } catch (error) {
    console.error("Error updating ingredient:", error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /ingredient/{id}:
 *   delete:
 *     summary: Delete an ingredient
 *     tags: [Ingredient]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier of the ingredient
 *     responses:
 *       200:
 *         description: Ingredient deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Confirmation message
 *       404:
 *         description: Ingredient not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete("/:id", async (req, res) => {
  try {
    const ingredient = await Ingredient.findById(req.params.id);
    if (!ingredient) {
      return res.status(404).json({ error: "Ingredient not found" });
    }

    if (ingredient.photo) {
      const photoPath = path.join(__dirname, "../../", ingredient.photo);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }

    await Ingredient.findByIdAndDelete(req.params.id);
    res.json({ message: "Ingredient deleted successfully" });
  } catch (error) {
    console.error("Error deleting ingredient:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /ingredient/{id}/archive:
 *   put:
 *     summary: Archive an ingredient
 *     tags: [Ingredient]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier of the ingredient
 *     responses:
 *       200:
 *         description: Ingredient archived successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Confirmation message
 *                 ingredient:
 *                   $ref: '#/components/schemas/Ingredient'
 *       400:
 *         description: Ingredient already archived
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Ingredient not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put("/:id/archive", async (req, res) => {
  try {
    const ingredient = await Ingredient.findById(req.params.id);
    if (!ingredient) {
      return res.status(404).json({ error: "Ingredient not found" });
    }

    if (ingredient.archived) {
      return res.status(400).json({ error: "Ingredient is already archived" });
    }

    const updatedIngredient = await Ingredient.findByIdAndUpdate(
      req.params.id,
      { archived: true },
      { new: true }
    );

    res.json({
      message: "Ingredient archived successfully",
      ingredient: updatedIngredient,
    });
  } catch (error) {
    console.error("Error archiving ingredient:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /ingredient/{id}/restore:
 *   put:
 *     summary: Restore an archived ingredient
 *     tags: [Ingredient]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier of the ingredient
 *     responses:
 *       200:
 *         description: Ingredient restored successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Confirmation message
 *                 ingredient:
 *                   $ref: '#/components/schemas/Ingredient'
 *       400:
 *         description: Ingredient not archived
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Ingredient not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put("/:id/restore", async (req, res) => {
  try {
    const ingredient = await Ingredient.findById(req.params.id);
    if (!ingredient) {
      return res.status(404).json({ error: "Ingredient not found" });
    }

    if (!ingredient.archived) {
      return res.status(400).json({ error: "Ingredient is not archived" });
    }

    const updatedIngredient = await Ingredient.findByIdAndUpdate(
      req.params.id,
      { archived: false },
      { new: true }
    );

    res.json({
      message: "Ingredient restored successfully",
      ingredient: updatedIngredient,
    });
  } catch (error) {
    console.error("Error restoring ingredient:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;