/**
 * @swagger
 * tags:
 *   - name: Product
 *     description: Gestion des produits
 *
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         price:
 *           type: number
 *         description:
 *           type: string
 *         promotion:
 *           type: string
 *         disponibility:
 *           type: boolean
 *         duration:
 *           type: string
 *         categoryFK:
 *           type: string
 *         typePlat:
 *           type: string
 *         photo:
 *           type: string
 *         archived:
 *           type: boolean
 *         recipeFK:
 *           type: string
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
 * /product:
 *   post:
 *     summary: Ajouter un produit (avec upload d'image)
 *     tags: [Product]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               promotion:
 *                 type: string
 *               disponibility:
 *                 type: boolean
 *               duration:
 *                 type: string
 *               categoryFK:
 *                 type: string
 *               typePlat:
 *                 type: string
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Produit ajouté
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Erreur de validation ou d'upload
 *   get:
 *     summary: Obtenir tous les produits (hors plat du jour)
 *     tags: [Product]
 *     responses:
 *       200:
 *         description: Liste des produits
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       500:
 *         description: Erreur serveur
 */

/**
 * @swagger
 * /product/{id}:
 *   get:
 *     summary: Obtenir un produit par son ID
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du produit
 *     responses:
 *       200:
 *         description: Produit trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Produit non trouvé
 *   put:
 *     summary: Modifier un produit (avec upload d'image)
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du produit
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               promotion:
 *                 type: string
 *               disponibility:
 *                 type: boolean
 *               duration:
 *                 type: string
 *               categoryFK:
 *                 type: string
 *               typePlat:
 *                 type: string
 *               archived:
 *                 type: boolean
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Produit modifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Produit non trouvé
 *       400:
 *         description: Erreur de validation ou d'upload
 *   delete:
 *     summary: Supprimer un produit (cascade plat du jour et recette)
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du produit
 *     responses:
 *       200:
 *         description: Produit supprimé
 *       404:
 *         description: Produit non trouvé
 *       500:
 *         description: Erreur serveur
 */

/**
 * @swagger
 * /product/{id}/archive:
 *   put:
 *     summary: Archiver un produit
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du produit
 *     responses:
 *       200:
 *         description: Produit archivé
 *       404:
 *         description: Produit non trouvé
 *       400:
 *         description: Produit déjà archivé
 *       500:
 *         description: Erreur serveur
 *
 * /product/{id}/restore:
 *   put:
 *     summary: Restaurer un produit archivé
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du produit
 *     responses:
 *       200:
 *         description: Produit restauré
 *       404:
 *         description: Produit non trouvé
 *       400:
 *         description: Produit non archivé
 *       500:
 *         description: Erreur serveur
 */

/**
 * @swagger
 * /product/category/{categoryId}:
 *   get:
 *     summary: Obtenir les produits d'une catégorie (hors plat du jour)
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la catégorie
 *     responses:
 *       200:
 *         description: Produits associés à la catégorie
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       500:
 *         description: Erreur serveur
 */
const express = require("express");
const router = express.Router();
const Product = require("../../models/Product");
const Ingredieent = require("../../models/Ingredieent");
const DishOfTheDay = require("../../models/DishOfTheDay");
const Recipe = require("../../models/Recipe");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure multer storage
const uploadDir = path.join(__dirname, "../../Uploads/products");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error("Images only (jpeg, jpg, png) allowed!"));
  },
}).single("photo");

// Middleware to handle multer errors
const uploadMiddleware = (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
};

// Create new product
router.post("/", uploadMiddleware, async (req, res) => {
  try {
    const {
      name,
      price,
      description,
      promotion,
      disponibility,
      duration,
      categoryFK,
      typePlat,
    } = req.body;
    if (!name || !price || !categoryFK || !typePlat) {
      return res
        .status(400)
        .json({ error: "Name, price, category, and typePlat are required" });
    }

    const productData = {
      name,
      price: parseFloat(price),
      description,
      promotion,
      disponibility: disponibility === "true",
      duration,
      categoryFK,
      typePlat,
      photo: req.file ? `/Uploads/products/${req.file.filename}` : null,
      archived: false,
    };

    const product = new Product(productData);
    const savedProduct = await product.save();
    res.json(
      await Product.findById(savedProduct._id)
        .populate("categoryFK")
        .populate("recipeFK")
    );
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all products (exclude those in DishOfTheDay)
router.get("/", async (req, res) => {
  try {
    const dishOfTheDayProducts = await DishOfTheDay.find().distinct(
      "productFK"
    );
    const products = await Product.find({
      _id: { $nin: dishOfTheDayProducts },
      archived: false,
    })
      .populate("categoryFK")
      .populate("recipeFK");
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single product
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("categoryFK")
      .populate("recipeFK");
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update product
router.put("/:id", uploadMiddleware, async (req, res) => {
  try {
    const {
      name,
      price,
      description,
      promotion,
      disponibility,
      duration,
      categoryFK,
      typePlat,
    } = req.body;
    if (!name || !price || !categoryFK || !typePlat) {
      return res
        .status(400)
        .json({ error: "Name, price, category, and typePlat are required" });
    }

    const existingProduct = await Product.findById(req.params.id);
    if (!existingProduct)
      return res.status(404).json({ error: "Product not found" });

    const updateData = {
      name,
      price: parseFloat(price),
      description,
      promotion,
      disponibility: disponibility === "true",
      duration,
      categoryFK,
      typePlat,
      archived: req.body.archived
        ? req.body.archived === "true"
        : existingProduct.archived,
    };

    if (req.file) {
      if (existingProduct.photo) {
        const oldPhotoPath = path.join(
          __dirname,
          "../../",
          existingProduct.photo
        );
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }
      updateData.photo = `/Uploads/products/${req.file.filename}`;
    } else {
      updateData.photo = existingProduct.photo;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )
      .populate("categoryFK")
      .populate("recipeFK");

    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete product
router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    if (product.photo) {
      const photoPath = path.join(__dirname, "../../", product.photo);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }

    if (product.recipeFK) {
      await Recipe.findByIdAndDelete(product.recipeFK);
    }

    // Remove from DishOfTheDay if it exists
    await DishOfTheDay.deleteMany({ productFK: product._id });

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Archive product
router.put("/:id/archive", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (product.archived) {
      return res.status(400).json({ error: "Product is already archived" });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { archived: true },
      { new: true }
    )
      .populate("categoryFK")
      .populate("recipeFK");

    res.json({
      message: "Product archived successfully",
      product: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Restore product
router.put("/:id/restore", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (!product.archived) {
      return res.status(400).json({ error: "Product is not archived" });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { archived: false },
      { new: true }
    )
      .populate("categoryFK")
      .populate("recipeFK");

    res.json({
      message: "Product restored successfully",
      product: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get products by category
router.get("/category/:categoryId", async (req, res) => {
  try {
    const dishOfTheDayProducts = await DishOfTheDay.find().distinct(
      "productFK"
    );
    const products = await Product.find({
      categoryFK: req.params.categoryId,
      _id: { $nin: dishOfTheDayProducts },
      archived: false,
    })
      .populate("categoryFK")
      .populate("recipeFK");

    const productsWithDetails = await Promise.all(
      products.map(async (product) => {
        const ingredients = await mongoose
          .model("Ingredieent")
          .find({ productFK: product._id });
        return {
          ...product.toObject(),
          ingredients,
        };
      })
    );

    res.json(productsWithDetails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
