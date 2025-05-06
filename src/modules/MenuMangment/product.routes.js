/**
 * @swagger
 * tags:
 *   - name: Product
 *     description: Product management operations
 *
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - price
 *         - categoryFK
 *         - typePlat
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated product ID
 *         name:
 *           type: string
 *           description: Product name
 *         price:
 *           type: number
 *           description: Product price
 *         description:
 *           type: string
 *           description: Product description
 *         promotion:
 *           type: string
 *           description: Promotion details
 *         disponibility:
 *           type: boolean
 *           description: Product availability status
 *         duration:
 *           type: string
 *           description: Product duration
 *         categoryFK:
 *           type: string
 *           description: Foreign key for category
 *         typePlat:
 *           type: string
 *           description: Type of dish
 *         photo:
 *           type: string
 *           description: Product image URL
 *         archived:
 *           type: boolean
 *           description: Product archival status
 *         recipeFK:
 *           type: string
 *           description: Foreign key for recipe
 *     Ingredient:
 *       type: object
 *       required:
 *         - libelle
 *         - quantity
 *         - type
 *         - price
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated ingredient ID
 *         libelle:
 *           type: string
 *           description: Ingredient name
 *         quantity:
 *           type: number
 *           description: Ingredient quantity
 *         type:
 *           type: string
 *           description: Ingredient type
 *         price:
 *           type: number
 *           description: Ingredient price
 *         disponibility:
 *           type: boolean
 *           description: Ingredient availability
 *         qtMax:
 *           type: number
 *           description: Maximum quantity
 *         photo:
 *           type: string
 *           description: Ingredient image URL
 *         archived:
 *           type: boolean
 *           description: Ingredient archival status
 */

/**
 * @swagger
 * /product:
 *   post:
 *     summary: Create a new product with image upload
 *     tags: [Product]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - categoryFK
 *               - typePlat
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
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid input or upload error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Server error
 *   get:
 *     summary: Get all products (excluding dish of the day)
 *     tags: [Product]
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /product/{id}:
 *   get:
 *     summary: Get a product by ID
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 *   put:
 *     summary: Update a product with image upload
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - categoryFK
 *               - typePlat
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
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid input or upload error
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Delete a product (cascades to dish of the day and recipe)
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /product/{id}/archive:
 *   put:
 *     summary: Archive a product
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product archived successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 product:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Product already archived
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 *
 * /product/{id}/restore:
 *   put:
 *     summary: Restore an archived product
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product restored successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 product:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Product not archived
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /product/category/{categoryId}:
 *   get:
 *     summary: Get products by category (excluding dish of the day)
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Products in category
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 allOf:
 *                   - $ref: '#/components/schemas/Product'
 *                   - type: object
 *                     properties:
 *                       ingredients:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/Ingredient'
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
const express = require("express");
const router = express.Router();
const Product = require("../../models/Product");
const Ingredient = require("../../models/Ingredieent");
const DishOfTheDay = require("../../models/DishOfTheDay");
const Recipe = require("../../models/Recipe");
const Category = require("../../models/Category"); // Assuming Category model exists
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure multer storage
const uploadDir = path.join(__dirname, "../../uploads/products");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
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

// Validate category and typePlat
const validateInputs = async (categoryFK, typePlat) => {
  if (!mongoose.Types.ObjectId.isValid(categoryFK)) {
    throw new Error("Invalid category ID");
  }
  const category = await Category.findById(categoryFK);
  if (!category) {
    throw new Error("Category not found");
  }
  const validTypePlats = ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'non-vegetarian']; // Adjust based on your requirements
  if (!validTypePlats.includes(typePlat)) {
    throw new Error("Invalid typePlat");
  }
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

    await validateInputs(categoryFK, typePlat);

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
    
    const populatedProduct = await Product.findById(savedProduct._id)
      .populate("categoryFK")
      .populate("recipeFK")
      .catch((err) => {
        throw new Error("Error populating product data: " + err.message);
      });

    res.status(201).json(populatedProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all products (exclude those in DishOfTheDay)
router.get("/", async (req, res) => {
  try {
    const dishOfTheDayProducts = await DishOfTheDay.find().distinct("productFK");
    const products = await Product.find({
      _id: { $nin: dishOfTheDayProducts },
      archived: false,
    })
      .populate("categoryFK")
      .populate("recipeFK")
      .catch((err) => {
        throw new Error("Error populating products: " + err.message);
      });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single product
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    const product = await Product.findById(req.params.id)
      .populate("categoryFK")
      .populate("recipeFK")
      .catch((err) => {
        throw new Error("Error populating product: " + err.message);
      });

    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update product
router.put("/:id", uploadMiddleware, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

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

    await validateInputs(categoryFK, typePlat);

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
        const oldPhotoPath = path.join(__dirname, "../../", existingProduct.photo);
        try {
          if (fs.existsSync(oldPhotoPath)) {
            fs.unlinkSync(oldPhotoPath);
          }
        } catch (err) {
          console.error("Error deleting old photo:", err);
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
      . EVENESScatch((err) => {
        throw new Error("Error populating updated product: " + err.message);
      });

    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete product
router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    if (product.photo) {
      const photoPath = path.join(__dirname, "../../", product.photo);
      try {
        if (fs.existsSync(photoPath)) {
          fs.unlinkSync(photoPath);
        }
      } catch (err) {
        console.error("Error deleting photo:", err);
      }
    }

    if (product.recipeFK) {
      await Recipe.findByIdAndDelete(product.recipeFK);
    }

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
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

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
      .populate("recipeFK")
      .catch((err) => {
        throw new Error("Error populating archived product: " + err.message);
      });

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
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

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
      .populate("recipeFK")
      .catch((err) => {
        throw new Error("Error populating restored product: " + err.message);
      });

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
    if (!mongoose.Types.ObjectId.isValid(req.params.categoryId)) {
      return res.status(400).json({ error: "Invalid category ID" });
    }

    const category = await Category.findById(req.params.categoryId);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    const dishOfTheDayProducts = await DishOfTheDay.find().distinct("productFK");
    const products = await Product.find({
      categoryFK: req.params.categoryId,
      _id: { $nin: dishOfTheDayProducts },
      archived: false,
    })
      .populate("categoryFK")
      .populate("recipeFK")
      .catch((err) => {
        throw new Error("Error populating products: " + err.message);
      });

    const productsWithDetails = await Promise.all(
      products.map(async (product) => {
        const ingredients = await Ingredient.find({ productFK: product._id });
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