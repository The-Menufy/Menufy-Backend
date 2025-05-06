const express = require("express");
const router = express.Router();
const Category = require("../../models/Category");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Product = require("../../models/Product");

// Crée le dossier si non existant
const uploadDir = path.join(__dirname, "../../Uploads/category");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Configuration Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ 
  storage,
  limits: { fileSize: 5000000 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb("Error: Images only (jpeg, jpg, png)!");
  }
});

/**
 * @swagger
 * tags:
 *   - name: Category
 *     description: Operations for managing menu categories
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       required:
 *         - libelle
 *         - visibility
 *         - menu
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the category
 *         libelle:
 *           type: string
 *           description: Name of the category
 *         description:
 *           type: string
 *           description: Optional description of the category
 *         visibility:
 *           type: string
 *           enum: [visible, archived]
 *           description: Visibility status of the category
 *         menu:
 *           type: string
 *           description: ID of the menu this category belongs to
 *         photo:
 *           type: string
 *           description: Path to the uploaded category image
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
 * /category/upload:
 *   post:
 *     summary: Create a new category with optional photo upload
 *     tags: [Category]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - libelle
 *               - visibility
 *               - menu
 *             properties:
 *               libelle:
 *                 type: string
 *                 description: Name of the category
 *               description:
 *                 type: string
 *                 description: Optional description of the category
 *               visibility:
 *                 type: string
 *                 enum: [visible, archived]
 *                 description: Visibility status of the category
 *               menu:
 *                 type: string
 *                 description: ID of the menu this category belongs to
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Category image file (jpeg, jpg, png; max 5MB)
 *     responses:
 *       200:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
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
router.post("/upload", upload.single("photo"), async (req, res) => {
  console.log("Request body:", req.body); // Log the form fields
  console.log("Uploaded file:", req.file); // Log the file details

  // Validate required fields
  const { libelle, visibility, menu } = req.body;
  if (!libelle || !visibility || !menu) {
    return res
      .status(400)
      .json({ error: "Libelle, visibility, and menu are required fields" });
  }

  const category = new Category({
    libelle: req.body.libelle,
    description: req.body.description,
    visibility: req.body.visibility,
    menu: req.body.menu,
    photo: req.file ? `/Uploads/category/${req.file.filename}` : "",
  });

  try {
    const saved = await category.save();
    console.log("Saved category:", saved); // Log the saved document
    res.json(saved);
  } catch (err) {
    console.error("Error saving category:", err); // Log the error
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /category/upload/{id}:
 *   put:
 *     summary: Update a category with optional photo upload
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier of the category
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - libelle
 *               - visibility
 *               - menu
 *             properties:
 *               libelle:
 *                 type: string
 *                 description: Name of the category
 *               description:
 *                 type: string
 *                 description: Optional description of the category
 *               visibility:
 *                 type: string
 *                 enum: [visible, archived]
 *                 description: Visibility status of the category
 *               menu:
 *                 type: string
 *                 description: ID of the menu this category belongs to
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Category image file (jpeg, jpg, png; max 5MB)
 *     responses:
 *       200:
 *         description: Category updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       400:
 *         description: Validation error or invalid image upload
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Category not found
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
router.put("/upload/:id", upload.single("photo"), async (req, res) => {
  try {
    console.log("Request body:", req.body); // Log the form fields
    console.log("Uploaded file:", req.file); // Log the file details

    // Validate required fields
    const { libelle, description, visibility, menu } = req.body;
    if (!libelle || !visibility || !menu) {
      return res
        .status(400)
        .json({ error: "Libelle, visibility, and menu are required fields" });
    }

    // Find the existing category
    const existingCategory = await Category.findById(req.params.id);
    if (!existingCategory) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Prepare the fields to update
    const updatedFields = {
      libelle,
      description,
      visibility,
      menu,
    };

    // Handle the photo field
    if (req.file) {
      // If a new photo is uploaded, delete the old photo file (if it exists)
      if (existingCategory.photo) {
        const oldPhotoPath = path.join(
          __dirname,
          "../../",
          existingCategory.photo
        );
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath); // Delete the old photo file
          console.log("Deleted old photo:", oldPhotoPath);
        }
      }
      // Update the photo field with the new file
      updatedFields.photo = `/Uploads/category/${req.file.filename}`;
    } else {
      // Preserve the existing photo if no new photo is uploaded
      updatedFields.photo = existingCategory.photo;
    }

    // Update the category in the database
    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      updatedFields,
      { new: true }
    ).populate("menu");
    if (!updated) {
      return res.status(404).json({ error: "Failed to update category" });
    }

    console.log("Updated category:", updated); // Log the updated document
    res.json(updated);
  } catch (err) {
    console.error("Error updating category:", err); // Log the error for debugging
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /category:
 *   get:
 *     summary: Retrieve all categories
 *     tags: [Category]
 *     responses:
 *       200:
 *         description: List of all categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find().populate("menu");
    res.json(categories);
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /category/{id}:
 *   get:
 *     summary: Retrieve a category by ID
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier of the category
 *     responses:
 *       200:
 *         description: Category retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       404:
 *         description: Category not found
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
    const category = await Category.findById(req.params.id).populate("menu");
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.json(category);
  } catch (err) {
    console.error("Error fetching category:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /category/{id}:
 *   delete:
 *     summary: Delete a category and its associated products
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier of the category
 *     responses:
 *       200:
 *         description: Category and associated products deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Confirmation message
 *       404:
 *         description: Category not found
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
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Delete the photo file if it exists
    if (category.photo) {
      const photoPath = path.join(__dirname, "../../", category.photo);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }

    // Cascade: Delete all products related to this category
    await Product.deleteMany({ categoryFK: category._id });

    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: "Category and related products deleted successfully" });
  } catch (err) {
    console.error("Error deleting category:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /category/menu/{menuId}:
 *   get:
 *     summary: Retrieve categories by menu ID
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: menuId
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier of the menu
 *     responses:
 *       200:
 *         description: List of categories for the specified menu
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 *       400:
 *         description: Invalid menu ID or other error
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
router.get("/menu/:menuId", async (req, res) => {
  try {
    const categories = await Category.find({ menu: req.params.menuId });
    res.json(categories);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /category/{id}/archive:
 *   put:
 *     summary: Archive a category
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier of the category
 *     responses:
 *       200:
 *         description: Category archived successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Confirmation message
 *                 category:
 *                   $ref: '#/components/schemas/Category'
 *       400:
 *         description: Category already archived
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Category not found
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

    // Vérifier si la catégorie existe
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Vérifier si la catégorie est déjà archivée
    if (category.visibility === "archived") {
      return res.status(400).json({ error: "Category is already archived" });
    }

    // Archiver la catégorie
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { visibility: "archived" },
      { new: true }
    );

    res.json({
      message: "Category archived successfully",
      category: updatedCategory,
    });
  } catch (error) {
    console.error("Error archiving category:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /category/{id}/restore:
 *   put:
 *     summary: Restore an archived category
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier of the category
 *     responses:
 *       200:
 *         description: Category restored successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Confirmation message
 *                 category:
 *                   $ref: '#/components/schemas/Category'
 *       400:
 *         description: Category not archived
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Category not found
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

    // Vérifier si la catégorie existe
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Vérifier si la catégorie est bien archivée
    if (category.visibility !== "archived") {
      return res.status(400).json({ error: "Category is not archived" });
    }

    // Restaurer la catégorie
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { visibility: "visible" },
      { new: true }
    ).populate("menu");

    res.json({
      message: "Category restored successfully",
      category: updatedCategory,
    });
  } catch (error) {
    console.error("Error restoring category:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;