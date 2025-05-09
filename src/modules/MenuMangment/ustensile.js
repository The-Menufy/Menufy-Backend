const express = require("express");
const router = express.Router();
const Ustensile = require("../../models/Ustensile");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;

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
 *   - name: Ustensile
 *     description: Operations for managing kitchen utensils
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Ustensile:
 *       type: object
 *       required:
 *         - libelle
 *         - quantity
 *         - disponibility
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the utensil
 *         libelle:
 *           type: string
 *           description: Name of the utensil
 *         quantity:
 *           type: number
 *           description: Quantity of the utensil available
 *         disponibility:
 *           type: boolean
 *           description: Availability status of the utensil
 *         photo:
 *           type: string
 *           description: Cloudinary URL of the uploaded utensil image
 *         archived:
 *           type: boolean
 *           description: Indicates if the utensil is archived
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
 * /ustensile:
 *   post:
 *     summary: Create a new utensil with optional image upload
 *     tags: [Ustensile]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - libelle
 *               - quantity
 *               - disponibility
 *             properties:
 *               libelle:
 *                 type: string
 *                 description: Name of the utensil
 *               quantity:
 *                 type: number
 *                 description: Quantity of the utensil available
 *               disponibility:
 *                 type: boolean
 *                 description: Availability status of the utensil
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Utensil image file (jpeg, jpg, png; max 5MB)
 *     responses:
 *       201:
 *         description: Utensil created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ustensile'
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
    const { libelle, quantity, disponibility } = req.body;

    if (!libelle || quantity === undefined || disponibility === undefined) {
      return res.status(400).json({ error: "Libelle, quantity, and disponibility are required" });
    }

    let photo = null;
    if (req.file) {
      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "ustensiles", // Store in a 'ustensiles' folder in Cloudinary
      });
      photo = result.secure_url; // Use the Cloudinary URL
      // Delete the temporary file
      fs.unlinkSync(req.file.path);
    }

    const ustensileData = {
      libelle,
      quantity: parseFloat(quantity),
      disponibility: disponibility === "true",
      photo,
      archived: false,
    };
    const ustensile = new Ustensile(ustensileData);
    const savedUstensile = await ustensile.save();
    res.status(201).json(savedUstensile);
  } catch (error) {
    console.error("Error creating utensil:", error);
    // Clean up temporary file in case of error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /ustensile:
 *   get:
 *     summary: Retrieve all utensils
 *     tags: [Ustensile]
 *     responses:
 *       200:
 *         description: List of all utensils
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Ustensile'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", async (req, res) => {
  try {
    const ustensiles = await Ustensile.find();
    res.json(ustensiles);
  } catch (error) {
    console.error("Error fetching utensils:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /ustensile/{id}:
 *   get:
 *     summary: Retrieve a utensil by ID
 *     tags: [Ustensile]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier of the utensil
 *     responses:
 *       200:
 *         description: Utensil retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ustensile'
 *       404:
 *         description: Utensil not found
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
    const ustensile = await Ustensile.findById(req.params.id);
    if (!ustensile) {
      return res.status(404).json({ error: "Ustensile not found" });
    }
    res.json(ustensile);
  } catch (error) {
    console.error("Error fetching utensil:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /ustensile/{id}:
 *   put:
 *     summary: Update a utensil with optional image upload
 *     tags: [Ustensile]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier of the utensil
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - libelle
 *               - quantity
 *               - disponibility
 *             properties:
 *               libelle:
 *                 type: string
 *                 description: Name of the utensil
 *               quantity:
 *                 type: number
 *                 description: Quantity of the utensil available
 *               disponibility:
 *                 type: boolean
 *                 description: Availability status of the utensil
 *               archived:
 *                 type: boolean
 *                 description: Archive status of the utensil
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Utensil image file (jpeg, jpg, png; max 5MB)
 *     responses:
 *       200:
 *         description: Utensil updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ustensile'
 *       400:
 *         description: Validation error or invalid image upload
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Utensil not found
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
    const { libelle, quantity, disponibility } = req.body;

    if (!libelle || quantity === undefined || disponibility === undefined) {
      return res.status(400).json({ error: "Libelle, quantity, and disponibility are required" });
    }

    const updateData = {
      libelle,
      quantity: parseFloat(quantity),
      disponibility: disponibility === "true",
      archived: req.body.archived ? req.body.archived === "true" : undefined,
    };

    const existingUstensile = await Ustensile.findById(req.params.id);
    if (!existingUstensile) {
      return res.status(404).json({ error: "Ustensile not found" });
    }

    if (req.file) {
      // Delete old image from Cloudinary if it exists
      if (existingUstensile.photo) {
        const publicId = existingUstensile.photo
          .split("/")
          .slice(-2)
          .join("/")
          .split(".")[0]; // Extract public ID from Cloudinary URL
        await cloudinary.uploader.destroy(publicId);
      }

      // Upload new image to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "ustensiles",
      });
      updateData.photo = result.secure_url; // Update with the new Cloudinary URL
      // Delete the temporary file
      fs.unlinkSync(req.file.path);
    }

    const ustensile = await Ustensile.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    res.json(ustensile);
  } catch (error) {
    console.error("Error updating utensil:", error);
    // Clean up temporary file in case of error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /ustensile/{id}:
 *   delete:
 *     summary: Delete a utensil
 *     tags: [Ustensile]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier of the utensil
 *     responses:
 *       200:
 *         description: Utensil deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Confirmation message
 *       404:
 *         description: Utensil not found
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
    const ustensile = await Ustensile.findById(req.params.id);
    if (!ustensile) {
      return res.status(404).json({ error: "Ustensile not found" });
    }

    if (ustensile.photo) {
      const publicId = ustensile.photo
        .split("/")
        .slice(-2)
        .join("/")
        .split(".")[0]; // Extract public ID from Cloudinary URL
      await cloudinary.uploader.destroy(publicId);
    }

    await Ustensile.findByIdAndDelete(req.params.id);
    res.json({ message: "Ustensile deleted successfully" });
  } catch (error) {
    console.error("Error deleting utensil:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /ustensile/{id}/archive:
 *   put:
 *     summary: Archive a utensil
 *     tags: [Ustensile]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier of the utensil
 *     responses:
 *       200:
 *         description: Utensil archived successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Confirmation message
 *                 ustensile:
 *                   $ref: '#/components/schemas/Ustensile'
 *       400:
 *         description: Utensil already archived
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Utensil not found
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
    const ustensile = await Ustensile.findById(req.params.id);
    if (!ustensile) {
      return res.status(404).json({ error: "Ustensile not found" });
    }

    if (ustensile.archived) {
      return res.status(400).json({ error: "Ustensile is already archived" });
    }

    const updatedUstensile = await Ustensile.findByIdAndUpdate(
      req.params.id,
      { archived: true },
      { new: true }
    );

    res.json({
      message: "Ustensile archived successfully",
      ustensile: updatedUstensile,
    });
  } catch (error) {
    console.error("Error archiving utensil:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /ustensile/{id}/restore:
 *   put:
 *     summary: Restore an archived utensil
 *     tags: [Ustensile]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier of the utensil
 *     responses:
 *       200:
 *         description: Utensil restored successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Confirmation message
 *                 ustensile:
 *                   $ref: '#/components/schemas/Ustensile'
 *       400:
 *         description: Utensil not archived
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Utensil not found
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
    const ustensile = await Ustensile.findById(req.params.id);
    if (!ustensile) {
      return res.status(404).json({ error: "Ustensile not found" });
    }

    if (!ustensile.archived) {
      return res.status(400).json({ error: "Ustensile is not archived" });
    }

    const updatedUstensile = await Ustensile.findByIdAndUpdate(
      req.params.id,
      { archived: false },
      { new: true }
    );

    res.json({
      message: "Ustensile restored successfully",
      ustensile: updatedUstensile,
    });
  } catch (error) {
    console.error("Error restoring utensil:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;