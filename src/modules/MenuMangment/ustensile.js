/**
 * @swagger
 * tags:
 *   - name: Ustensile
 *     description: Gestion des ustensiles de cuisine
 *
 * components:
 *   schemas:
 *     Ustensile:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         libelle:
 *           type: string
 *         quantity:
 *           type: number
 *         disponibility:
 *           type: boolean
 *         photo:
 *           type: string
 *         archived:
 *           type: boolean
 */

/**
 * @swagger
 * /ustensile:
 *   post:
 *     summary: Ajouter un ustensile (avec upload d'image)
 *     tags: [Ustensile]
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
 *               disponibility:
 *                 type: boolean
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Ustensile ajouté
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ustensile'
 *       400:
 *         description: Erreur de validation ou d'upload
 *   get:
 *     summary: Obtenir tous les ustensiles
 *     tags: [Ustensile]
 *     responses:
 *       200:
 *         description: Liste des ustensiles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Ustensile'
 *       400:
 *         description: Erreur serveur
 */

/**
 * @swagger
 * /ustensile/{id}:
 *   get:
 *     summary: Obtenir un ustensile par son ID
 *     tags: [Ustensile]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'ustensile
 *     responses:
 *       200:
 *         description: Ustensile trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ustensile'
 *       404:
 *         description: Ustensile non trouvé
 *   put:
 *     summary: Modifier un ustensile (avec upload d'image)
 *     tags: [Ustensile]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'ustensile
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
 *               disponibility:
 *                 type: boolean
 *               archived:
 *                 type: boolean
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Ustensile modifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ustensile'
 *       404:
 *         description: Ustensile non trouvé
 *       400:
 *         description: Erreur de validation ou d'upload
 *   delete:
 *     summary: Supprimer un ustensile
 *     tags: [Ustensile]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'ustensile
 *     responses:
 *       200:
 *         description: Ustensile supprimé
 *       404:
 *         description: Ustensile non trouvé
 *       400:
 *         description: Erreur serveur
 */

/**
 * @swagger
 * /ustensile/{id}/archive:
 *   put:
 *     summary: Archiver un ustensile
 *     tags: [Ustensile]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'ustensile
 *     responses:
 *       200:
 *         description: Ustensile archivé
 *       404:
 *         description: Ustensile non trouvé
 *       400:
 *         description: Ustensile déjà archivé
 *       500:
 *         description: Erreur serveur
 *
 * /ustensile/{id}/restore:
 *   put:
 *     summary: Restaurer un ustensile archivé
 *     tags: [Ustensile]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'ustensile
 *     responses:
 *       200:
 *         description: Ustensile restauré
 *       404:
 *         description: Ustensile non trouvé
 *       400:
 *         description: Ustensile non archivé
 *       500:
 *         description: Erreur serveur
 */
const express = require("express");
const router = express.Router();
const Ustensile = require("../../models/Ustensile");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure multer storage
const uploadDir = path.join(__dirname, "../../Uploads/ustensiles");
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

// Create new ustensile with image upload
router.post("/", upload, async (req, res) => {
  try {
    const ustensileData = {
      libelle: req.body.libelle,
      quantity: parseFloat(req.body.quantity),
      disponibility: req.body.disponibility === "true",
      photo: req.file ? `/Uploads/ustensiles/${req.file.filename}` : null,
      archived: false, // Ensure new ustensiles are not archived
    };
    const ustensile = new Ustensile(ustensileData);
    res.json(await ustensile.save());
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all ustensiles
router.get("/", async (req, res) => {
  try {
    res.json(await Ustensile.find());
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get single ustensile
router.get("/:id", async (req, res) => {
  try {
    const ustensile = await Ustensile.findById(req.params.id);
    if (!ustensile)
      return res.status(404).json({ error: "Ustensile not found" });
    res.json(ustensile);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update ustensile (with optional image upload)
router.put("/:id", upload, async (req, res) => {
  try {
    const updateData = {
      libelle: req.body.libelle,
      quantity: parseFloat(req.body.quantity),
      disponibility: req.body.disponibility === "true",
      archived: req.body.archived ? req.body.archived === "true" : undefined,
    };

    if (req.file) {
      const existingUstensile = await Ustensile.findById(req.params.id);
      if (existingUstensile && existingUstensile.photo) {
        const oldPhotoPath = path.join(
          __dirname,
          "../../",
          existingUstensile.photo
        );
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }
      updateData.photo = `/Uploads/ustensiles/${req.file.filename}`;
    }

    const ustensile = await Ustensile.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (!ustensile)
      return res.status(404).json({ error: "Ustensile not found" });
    res.json(ustensile);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete ustensile
router.delete("/:id", async (req, res) => {
  try {
    const ustensile = await Ustensile.findById(req.params.id);
    if (!ustensile)
      return res.status(404).json({ error: "Ustensile not found" });

    if (ustensile.photo) {
      const photoPath = path.join(__dirname, "../../", ustensile.photo);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }

    await Ustensile.findByIdAndDelete(req.params.id);
    res.json({ message: "Ustensile deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Archive ustensile
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
    res.status(500).json({ error: error.message });
  }
});

// Restore ustensile
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
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
