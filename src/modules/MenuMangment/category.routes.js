/**
 * @swagger
 * tags:
 *   - name: Category
 *     description: Menu categories management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Category ID
 *         libelle:
 *           type: string
 *           description: Category name
 *         description:
 *           type: string
 *         visibility:
 *           type: string
 *           enum: [visible, archived]
 *         menu:
 *           type: string
 *           description: Menu ID this category belongs to
 *         photo:
 *           type: string
 *           description: Photo URL
 */

/**
 * @swagger
 * /category/upload:
 *   post:
 *     summary: Create a category with photo upload
 *     tags: [Category]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               libelle:
 *                 type: string
 *                 description: Category name
 *               description:
 *                 type: string
 *               visibility:
 *                 type: string
 *                 enum: [visible, archived]
 *               menu:
 *                 type: string
 *                 description: Menu ID
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Category photo (image file)
 *     responses:
 *       200:
 *         description: The created category
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 */

/**
 * @swagger
 * /category/upload/{id}:
 *   put:
 *     summary: Update a category with photo upload
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Category ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               libelle:
 *                 type: string
 *               description:
 *                 type: string
 *               visibility:
 *                 type: string
 *               menu:
 *                 type: string
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: The updated category
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       404:
 *         description: Category not found
 */

/**
 * @swagger
 * /category:
 *   get:
 *     summary: Get all categories
 *     tags: [Category]
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 */

/**
 * @swagger
 * /category/{id}:
 *   get:
 *     summary: Get category by ID
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Category ID
 *     responses:
 *       200:
 *         description: The category object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       404:
 *         description: Category not found
 *   delete:
 *     summary: Delete a category and its products
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category and products deleted
 *       404:
 *         description: Category not found
 */

/**
 * @swagger
 * /category/menu/{menuId}:
 *   get:
 *     summary: Get categories by menu ID
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: menuId
 *         schema:
 *           type: string
 *         required: true
 *         description: Menu ID
 *     responses:
 *       200:
 *         description: Categories for a menu
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 */

/**
 * @swagger
 * /category/{id}/archive:
 *   put:
 *     summary: Archive a category
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category archived
 *       404:
 *         description: Category not found
 */

/**
 * @swagger
 * /category/{id}/restore:
 *   put:
 *     summary: Restore an archived category
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category restored
 *       404:
 *         description: Category not found
 */
const express = require("express");
const router = express.Router();
const Category = require("../../models/Category");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Product = require("../../models/Product");

// Crée le dossier si non existant
const uploadDir = path.join(__dirname, "../../uploads/category");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Configuration Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// 🔁 Route POST avec upload
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
    photo: req.file ? `/uploads/category/${req.file.filename}` : "",
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

// 🔁 Route PUT avec upload
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
      updatedFields.photo = `/uploads/category/${req.file.filename}`;
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

// Routes existantes
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find().populate("menu");
    res.json(categories);
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ error: err.message });
  }
});

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
}); // In your category route file (e.g., routes/category.js)
router.get("/menu/:menuId", async (req, res) => {
  try {
    const categories = await Category.find({ menu: req.params.menuId }); // Assuming a menuFK field in Category model
    res.json(categories);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
// ✅ Route pour archiver une catégorie
router.put("/:id/archive", async (req, res) => {
  try {
    const { id } = req.params;

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { visibility: "archived" },
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json({
      message: "Category archived successfully",
      category: updatedCategory,
    });
  } catch (error) {
    console.error("Error archiving category:", error);
    res.status(500).json({ error: error.message });
  }
});
// ✅ Route pour restaurer une catégorie archivée
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
