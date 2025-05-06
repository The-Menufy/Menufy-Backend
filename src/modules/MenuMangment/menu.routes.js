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

/**
 * @swagger
 * tags:
 *   - name: Menu
 *     description: Operations for managing menus
 *
 * components:
 *   schemas:
 *     Menu:
 *       type: object
 *       required:
 *         - name
 *         - visibility
 *         - rate
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the menu
 *         name:
 *           type: string
 *           description: Name of the menu
 *         photo:
 *           type: string
 *           description: Path to the uploaded menu image
 *         visibility:
 *           type: string
 *           description: Visibility status of the menu (e.g., public, private)
 *         rate:
 *           type: number
 *           description: Rating or price of the menu
 *         archived:
 *           type: boolean
 *           description: Indicates if the menu is archived
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
 * /menu:
 *   post:
 *     summary: Create a new menu with optional image upload
 *     tags: [Menu]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - visibility
 *               - rate
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the menu
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Image file for the menu (jpeg, jpg, png; max 5MB)
 *               visibility:
 *                 type: string
 *                 description: Visibility status of the menu
 *               rate:
 *                 type: number
 *                 description: Rating or price of the menu
 *     responses:
 *       201:
 *         description: Menu created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Menu'
 *       400:
 *         description: Validation error or invalid image upload
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @swagger
 * /menu:
 *   get:
 *     summary: Retrieve all menus
 *     tags: [Menu]
 *     responses:
 *       200:
 *         description: List of all menus
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Menu'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", async (req, res) => {
  try {
    const menus = await Menu.find();
    res.json(menus);
  } catch (error) {
    console.error("Error fetching menus:", error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /menu/{id}:
 *   get:
 *     summary: Retrieve a menu by ID
 *     tags: [Menu]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier of the menu
 *     responses:
 *       200:
 *         description: Menu retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Menu'
 *       404:
 *         description: Menu not found
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

/**
 * @swagger
 * /menu/{id}:
 *   put:
 *     summary: Update a menu with optional image upload
 *     tags: [Menu]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier of the menu
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - visibility
 *               - rate
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the menu
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Image file for the menu (jpeg, jpg, png; max 5MB)
 *               visibility:
 *                 type: string
 *                 description: Visibility status of the menu
 *               rate:
 *                 type: number
 *                 description: Rating or price of the menu
 *               archived:
 *                 type: boolean
 *                 description: Archive status of the menu
 *     responses:
 *       200:
 *         description: Menu updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Menu'
 *       400:
 *         description: Validation error or invalid image upload
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Menu not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @swagger
 * /menu/{id}:
 *   delete:
 *     summary: Delete a menu and its associated categories and products
 *     tags: [Menu]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier of the menu
 *     responses:
 *       200:
 *         description: Menu and associated data deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Confirmation message
 *       404:
 *         description: Menu not found
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

/**
 * @swagger
 * /menu/{id}/archive:
 *   put:
 *     summary: Archive a menu
 *     tags: [Menu]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier of the menu
 *     responses:
 *       200:
 *         description: Menu archived successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Confirmation message
 *                 menu:
 *                   $ref: '#/components/schemas/Menu'
 *       400:
 *         description: Menu already archived
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Menu not found
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

/**
 * @swagger
 * /menu/{id}/restore:
 *   put:
 *     summary: Restore an archived menu
 *     tags: [Menu]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier of the menu
 *     responses:
 *       200:
 *         description: Menu restored successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Confirmation message
 *                 menu:
 *                   $ref: '#/components/schemas/Menu'
 *       400:
 *         description: Menu not archived
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Menu not found
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