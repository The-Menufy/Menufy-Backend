/**
 * @swagger
 * tags:
 *   - name: Menu
 *     description: Gestion des menus
 *
 * components:
 *   schemas:
 *     Menu:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         photo:
 *           type: string
 *         visibility:
 *           type: string
 *         rate:
 *           type: integer
 *         archived:
 *           type: boolean
 */

/**
 * @swagger
 * /menu:
 *   post:
 *     summary: Ajouter un menu (avec upload d'image)
 *     tags: [Menu]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               photo:
 *                 type: string
 *                 format: binary
 *               visibility:
 *                 type: string
 *               rate:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Menu créé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Menu'
 *       400:
 *         description: Erreur de validation ou d'upload
 *   get:
 *     summary: Obtenir tous les menus
 *     tags: [Menu]
 *     responses:
 *       200:
 *         description: Liste des menus
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Menu'
 *       400:
 *         description: Erreur serveur
 */

/**
 * @swagger
 * /menu/{id}:
 *   get:
 *     summary: Obtenir un menu par son ID
 *     tags: [Menu]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du menu
 *     responses:
 *       200:
 *         description: Menu trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Menu'
 *       404:
 *         description: Menu non trouvé
 *   put:
 *     summary: Modifier un menu (avec upload d'image)
 *     tags: [Menu]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du menu
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               photo:
 *                 type: string
 *                 format: binary
 *               visibility:
 *                 type: string
 *               rate:
 *                 type: integer
 *               archived:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Menu modifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Menu'
 *       404:
 *         description: Menu non trouvé
 *       400:
 *         description: Erreur de validation ou d'upload
 *   delete:
 *     summary: Supprimer un menu (et cascade sur catégories/produits)
 *     tags: [Menu]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du menu
 *     responses:
 *       200:
 *         description: Menu et catégories/produits associés supprimés
 *       404:
 *         description: Menu non trouvé
 *       400:
 *         description: Erreur serveur
 */

/**
 * @swagger
 * /menu/{id}/archive:
 *   put:
 *     summary: Archiver un menu
 *     tags: [Menu]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du menu
 *     responses:
 *       200:
 *         description: Menu archivé
 *       404:
 *         description: Menu non trouvé
 *       400:
 *         description: Menu déjà archivé
 *       500:
 *         description: Erreur serveur
 *
 * /menu/{id}/restore:
 *   put:
 *     summary: Restaurer un menu archivé
 *     tags: [Menu]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du menu
 *     responses:
 *       200:
 *         description: Menu restauré
 *       404:
 *         description: Menu non trouvé
 *       400:
 *         description: Menu non archivé
 *       500:
 *         description: Erreur serveur
 */
const express = require("express");
const router = express.Router();
const Menu = require("../../models/Menu");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Category = require("../../models/Category");
const Product = require("../../models/Product");

// Configure multer storage
const uploadDir = path.join(__dirname, "../../Uploads/menus");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

// Initialize upload
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

// Create new menu item with image upload
router.post("/", upload, async (req, res) => {
  try {
    // Validate required fields
    const { name, visibility, rate } = req.body;
    if (!name || !visibility || !rate) {
      return res
        .status(400)
        .json({ error: "Name, visibility, and rate are required" });
    }

    const menuData = {
      name,
      photo: req.file ? `/Uploads/menus/${req.file.filename}` : null,
      visibility,
      rate: parseInt(rate),
      archived: false, // Automatically set to not archived
    };

    const menu = new Menu(menuData);
    const savedMenu = await menu.save();
    res.status(201).json(savedMenu);
  } catch (error) {
    console.error("Error creating menu:", error);
    res.status(400).json({ error: error.message });
  }
});

// Update menu item
router.put("/:id", upload, async (req, res) => {
  try {
    // Validate required fields
    const { name, visibility, rate, archived } = req.body;
    if (!name || !visibility || !rate) {
      return res
        .status(400)
        .json({ error: "Name, visibility, and rate are required" });
    }

    const updateData = {
      name,
      visibility,
      rate: parseInt(rate),
      archived: archived ? archived === "true" : undefined,
    };

    if (req.file) {
      // Delete old photo if exists
      const existingMenu = await Menu.findById(req.params.id);
      if (existingMenu && existingMenu.photo) {
        const oldPhotoPath = path.join(__dirname, "../../", existingMenu.photo);
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }
      updateData.photo = `/Uploads/menus/${req.file.filename}`;
    }

    const menu = await Menu.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });
    if (!menu) {
      return res.status(404).json({ error: "Menu not found" });
    }
    res.json(menu);
  } catch (error) {
    console.error("Error updating menu:", error);
    res.status(400).json({ error: error.message });
  }
});

// Get all menu items
router.get("/", async (req, res) => {
  try {
    const menus = await Menu.find();
    res.json(menus);
  } catch (error) {
    console.error("Error fetching menus:", error);
    res.status(400).json({ error: error.message });
  }
});

// Get single menu item
router.get("/:id", async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.id);
    if (!menu) {
      return res.status(404).json({ error: "Menu not found" });
    }
    res.json(menu);
  } catch (error) {
    console.error("Error fetching menu:", error);
    res.status(400).json({ error: error.message });
  }
});

// Delete menu item
router.delete("/:id", async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.id);
    if (!menu) {
      return res.status(404).json({ error: "Menu not found" });
    }

    // Delete photo if exists
    if (menu.photo) {
      const photoPath = path.join(__dirname, "../../", menu.photo);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }

    // Cascade delete: Find all categories linked to this menu
    const categories = await Category.find({ menu: menu._id });
    for (const category of categories) {
      // Cascade: Delete all products related to this category
      await Product.deleteMany({ categoryFK: category._id });
      // Delete category photo if exists
      if (category.photo) {
        const catPhotoPath = path.join(__dirname, "../../", category.photo);
        if (fs.existsSync(catPhotoPath)) {
          fs.unlinkSync(catPhotoPath);
        }
      }
      // Delete the category itself
      await Category.findByIdAndDelete(category._id);
    }

    // Delete the menu
    await Menu.findByIdAndDelete(req.params.id);
    res.json({
      message: "Menu and related categories/products deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting menu:", error);
    res.status(400).json({ error: error.message });
  }
});
// Archive menu item
router.put("/:id/archive", async (req, res) => {
  try {
    const { id } = req.params;

    const menu = await Menu.findById(id);
    if (!menu) {
      return res.status(404).json({ error: "Menu not found" });
    }

    if (menu.archived) {
      return res.status(400).json({ error: "Menu is already archived" });
    }

    const updatedMenu = await Menu.findByIdAndUpdate(
      id,
      { archived: true },
      { new: true }
    );

    res.json({ message: "Menu archived successfully", menu: updatedMenu });
  } catch (error) {
    console.error("Error archiving menu:", error);
    res.status(500).json({ error: error.message });
  }
});

// Restore menu item
router.put("/:id/restore", async (req, res) => {
  try {
    const { id } = req.params;

    const menu = await Menu.findById(id);
    if (!menu) {
      return res.status(404).json({ error: "Menu not found" });
    }

    if (!menu.archived) {
      return res.status(400).json({ error: "Menu is not archived" });
    }

    const updatedMenu = await Menu.findByIdAndUpdate(
      id,
      { archived: false },
      { new: true }
    );

    res.json({ message: "Menu restored successfully", menu: updatedMenu });
  } catch (error) {
    console.error("Error restoring menu:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
