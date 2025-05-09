const express = require("express");
const multer = require("multer");
const path = require("path");
const RecipeVariant = require("../../models/recipeVariant");
const router = express.Router();
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Temporary storage for multer (files will be deleted after Cloudinary upload)
const uploadDir = path.join(__dirname, "../../temp");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({
  storage,
  limits: { fileSize: 5000000 }, // 5MB limit
}).single("photo");

console.log("recipeVariantRoutes loaded");

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
 *           description: Array of Cloudinary URLs for the variant images
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
router.post("/", upload, async (req, res) => {
  try {
    console.log("Request body:", req.body); // Log the form fields
    console.log("Uploaded file:", req.file); // Log the file details

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

    let images = [];
    if (req.file) {
      // Upload the image to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "recipe-variants", // Store in a 'recipe-variants' folder in Cloudinary
      });
      images.push(result.secure_url); // Get the Cloudinary URL
      console.log("Cloudinary upload result:", result); // Log the upload result

      // Delete the temporary file
      fs.unlinkSync(req.file.path);
      console.log("Deleted temporary file:", req.file.path);
    }

    const variant = new RecipeVariant({
      name,
      portions: parsedPortions,
      modifiedIngredientsGroup: Array.isArray(parsedIngredientsGroup) ? parsedIngredientsGroup : [],
      modifiedSteps: Array.isArray(parsedSteps) ? parsedSteps : [],
      note,
      images,
    });

    const savedVariant = await variant.save();
    res.status(201).json(savedVariant);
  } catch (err) {
    console.error("Error during variant creation:", err); // Log the error
    // Clean up temporary file in case of error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: err.message });
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

    // Delete associated images from Cloudinary
    if (deletedVariant.images && deletedVariant.images.length > 0) {
      for (const imageUrl of deletedVariant.images) {
        const publicId = imageUrl
          .split("/")
          .slice(-2)
          .join("/")
          .split(".")[0]; // Extract public ID from Cloudinary URL
        await cloudinary.uploader.destroy(publicId);
        console.log("Deleted photo from Cloudinary:", publicId);
      }
    }

    res.status(200).json({ message: "Variant deleted successfully" });
  } catch (error) {
    console.error("Error deleting variant:", error);
    res.status(500).json({ error: "Failed to delete variant" });
  }
});

// PUT to update a variant
router.put("/:id", upload, async (req, res) => {
  try {
    console.log("Request body:", req.body); // Log the form fields
    console.log("Uploaded file:", req.file); // Log the file details

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

    const existingVariant = await RecipeVariant.findById(id);
    if (!existingVariant) {
      return res.status(404).json({ error: "Variant not found" });
    }

    // Handle image update
    if (req.file) {
      // Delete old images from Cloudinary
      if (existingVariant.images && existingVariant.images.length > 0) {
        for (const imageUrl of existingVariant.images) {
          const publicId = imageUrl
            .split("/")
            .slice(-2)
            .join("/")
            .split(".")[0]; // Extract public ID from Cloudinary URL
          await cloudinary.uploader.destroy(publicId);
          console.log("Deleted old photo from Cloudinary:", publicId);
        }
      }

      // Upload new image to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "recipe-variants",
      });
      updateData.images = [result.secure_url]; // Update with the new Cloudinary URL
      console.log("Cloudinary upload result:", result);

      // Delete the temporary file
      fs.unlinkSync(req.file.path);
      console.log("Deleted temporary file:", req.file.path);
    } else {
      // Preserve existing images if no new photo is uploaded
      updateData.images = existingVariant.images;
    }

    const updatedVariant = await RecipeVariant.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json(updatedVariant);
  } catch (error) {
    console.error("Error updating variant:", error); // Log the error
    // Clean up temporary file in case of error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
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