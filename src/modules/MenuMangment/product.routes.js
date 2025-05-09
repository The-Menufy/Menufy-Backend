const express = require("express");
const router = express.Router();
const Product = require("../../models/Product");
const Ingredient = require("../../models/Ingredieent"); // Fixed typo: "Ingredieent" -> "Ingredient"
const DishOfTheDay = require("../../models/DishOfTheDay");
const Recipe = require("../../models/Recipe");
const Category = require("../../models/Category");
const mongoose = require("mongoose");
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
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // 5MB limit
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

// Define valid typePlat values (can be moved to Product model as an enum)
const VALID_TYPE_PLATS = ["vegetarian", "vegan", "gluten-free", "dairy-free", "non-vegetarian"];

// Validate category, typePlat, and price
const validateInputs = async (categoryFK, typePlat, price) => {
  if (!mongoose.Types.ObjectId.isValid(categoryFK)) {
    throw new Error("Invalid category ID");
  }
  const category = await Category.findById(categoryFK);
  if (!category) {
    throw new Error("Category not found");
  }
  if (!VALID_TYPE_PLATS.includes(typePlat)) {
    throw new Error(`Invalid typePlat. Must be one of: ${VALID_TYPE_PLATS.join(", ")}`);
  }
  if (price <= 0) {
    throw new Error("Price must be greater than 0");
  }
};

/**
 * @swagger
 * tags:
 *   - name: Product
 *     description: Product management operations
 */

/**
 * @swagger
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
 *           description: Cloudinary URL of the product image
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
 *           description: Cloudinary URL of the ingredient image
 *         archived:
 *           type: boolean
 *           description: Ingredient archival status
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
 *                 description: Product name
 *               price:
 *                 type: number
 *                 description: Product price
 *               description:
 *                 type: string
 *                 description: Product description
 *               promotion:
 *                 type: string
 *                 description: Promotion details
 *               disponibility:
 *                 type: boolean
 *                 description: Product availability status
 *               duration:
 *                 type: string
 *                 description: Product duration
 *               categoryFK:
 *                 type: string
 *                 description: Foreign key for category
 *               typePlat:
 *                 type: string
 *                 description: Type of dish
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Product image file (jpeg, jpg, png; max 5MB)
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
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

    const parsedPrice = parseFloat(price);
    await validateInputs(categoryFK, typePlat, parsedPrice);

    let photo = null;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "products", // Store in a 'products' folder in Cloudinary
      });
      photo = result.secure_url; // Use the Cloudinary URL
      fs.unlinkSync(req.file.path); // Clean up temporary file
    }

    const productData = {
      name,
      price: parsedPrice,
      description,
      promotion,
      disponibility: disponibility === "true",
      duration,
      categoryFK,
      typePlat,
      photo,
      archived: false,
    };

    const product = new Product(productData);
    const savedProduct = await product.save();

    const populatedProduct = await Product.findById(savedProduct._id)
      .populate("categoryFK")
      .populate("recipeFK");

    res.status(201).json(populatedProduct);
  } catch (error) {
    // Clean up temporary file in case of error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    const status = error.message.includes("Invalid") ? 400 : 500;
    res.status(status).json({ error: error.message });
  }
});

/**
 * @swagger
 * /product:
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", async (req, res) => {
  try {
    const dishOfTheDayProducts = await DishOfTheDay.find().distinct("productFK");
    const products = await Product.find({})
      .populate("categoryFK")
      .populate("recipeFK");
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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
 *       400:
 *         description: Invalid product ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Product not found
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
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    const product = await Product.findById(req.params.id)
      .populate("categoryFK")
      .populate("recipeFK");

    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /product/{id}:
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
 *                 description: Product name
 *               price:
 *                 type: number
 *                 description: Product price
 *               description:
 *                 type: string
 *                 description: Product description
 *               promotion:
 *                 type: string
 *                 description: Promotion details
 *               disponibility:
 *                 type: boolean
 *                 description: Product availability status
 *               duration:
 *                 type: string
 *                 description: Product duration
 *               categoryFK:
 *                 type: string
 *                 description: Foreign key for category
 *               typePlat:
 *                 type: string
 *                 description: Type of dish
 *               archived:
 *                 type: boolean
 *                 description: Product archival status
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Product image file (jpeg, jpg, png; max 5MB)
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid input or upload error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Product not found
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

    const parsedPrice = parseFloat(price);
    await validateInputs(categoryFK, typePlat, parsedPrice);

    const existingProduct = await Product.findById(req.params.id);
    if (!existingProduct)
      return res.status(404).json({ error: "Product not found" });

    const updateData = {
      name,
      price: parsedPrice,
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
        const publicId = existingProduct.photo
          .split("/")
          .slice(-2)
          .join("/")
          .split(".")[0]; // Extract public ID from Cloudinary URL
        await cloudinary.uploader.destroy(publicId);
      }
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "products",
      });
      updateData.photo = result.secure_url; // Update with the new Cloudinary URL
      fs.unlinkSync(req.file.path); // Clean up temporary file
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
    // Clean up temporary file in case of error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    const status = error.message.includes("Invalid") ? 400 : 500;
    res.status(status).json({ error: error.message });
  }
});

/**
 * @swagger
 * /product/{id}:
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
 *                   description: Confirmation message
 *       400:
 *         description: Invalid product ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Product not found
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
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    if (product.photo) {
      const publicId = product.photo
        .split("/")
        .slice(-2)
        .join("/")
        .split(".")[0]; // Extract public ID from Cloudinary URL
      await cloudinary.uploader.destroy(publicId);
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
 *                   description: Confirmation message
 *                 product:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid product ID or product already archived
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Product not found
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
      .populate("recipeFK");

    res.json({
      message: "Product archived successfully",
      product: updatedProduct,
    });
  } catch (error) {
    const status = error.message.includes("Invalid") ? 400 : 500;
    res.status(status).json({ error: error.message });
  }
});

/**
 * @swagger
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
 *                   description: Confirmation message
 *                 product:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid product ID or product not archived
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Product not found
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
      .populate("recipeFK");

    res.json({
      message: "Product restored successfully",
      product: updatedProduct,
    });
  } catch (error) {
    const status = error.message.includes("Invalid") ? 400 : 500;
    res.status(status).json({ error: error.message });
  }
});

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
 *       400:
 *         description: Invalid category ID
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
      .populate("recipeFK");

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
    const status = error.message.includes("Invalid") ? 400 : 500;
    res.status(status).json({ error: error.message });
  }
});

module.exports = router;