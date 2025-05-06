const express = require("express");
const router = express.Router();
const DishOfTheDay = require("../../models/DishOfTheDay");
const Product = require("../../models/Product");

/**
 * @swagger
 * tags:
 *   - name: DishOfTheDay
 *     description: Operations for managing the dish of the day
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     DishOfTheDay:
 *       type: object
 *       required:
 *         - date
 *         - productFK
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the dish of the day
 *         date:
 *           type: string
 *           format: date
 *           description: Date the dish is featured
 *         statut:
 *           type: string
 *           description: Status of the dish (e.g., Active)
 *           example: Active
 *         productFK:
 *           $ref: '#/components/schemas/Product'
 *           description: Reference to the associated product
 *     Product:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the product
 *         name:
 *           type: string
 *           description: Name of the product
 *         price:
 *           type: number
 *           description: Price of the product
 *         categoryFK:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *               description: Category ID
 *             libelle:
 *               type: string
 *               description: Category name
 *           description: Reference to the associated category
 *         recipeFK:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *               description: Recipe ID
 *             ingredientsGroup:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   items:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         ingredient:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                               description: Ingredient ID
 *                             libelle:
 *                               type: string
 *                               description: Ingredient name
 *                             photo:
 *                               type: string
 *                               description: Ingredient image path
 *                             qtMax:
 *                               type: number
 *                               description: Maximum quantity
 *             utensils:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: Utensil ID
 *                   libelle:
 *                     type: string
 *                     description: Utensil name
 *                   quantity:
 *                     type: number
 *                     description: Quantity available
 *                   disponibility:
 *                     type: boolean
 *                     description: Availability status
 *                   photo:
 *                     type: string
 *                     description: Utensil image path
 *             variants:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: Variant ID
 *                   name:
 *                     type: string
 *                     description: Variant name
 *                   portions:
 *                     type: number
 *                     description: Number of portions
 *                   images:
 *                     type: array
 *                     items:
 *                       type: string
 *                       description: Image paths
 *           description: Reference to the associated recipe
 *     Error:
 *       type: object
 *       required:
 *         - message
 *       properties:
 *         message:
 *           type: string
 *           description: Error message
 *         error:
 *           type: string
 *           description: Detailed error information
 */

/**
 * @swagger
 * /dish:
 *   post:
 *     summary: Create a new dish of the day
 *     tags: [DishOfTheDay]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - productFK
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Date the dish is featured
 *                 example: "2024-05-04"
 *               statut:
 *                 type: string
 *                 description: Status of the dish
 *                 example: Active
 *               productFK:
 *                 type: string
 *                 description: ID of the associated product
 *     responses:
 *       201:
 *         description: Dish of the day created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DishOfTheDay'
 *       400:
 *         description: Invalid data or product not found
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
router.post("/", async (req, res) => {
  try {
    const { date, statut, productFK } = req.body;

    if (!date || !productFK) {
      return res
        .status(400)
        .json({ message: "Date and productFK are required" });
    }

    const product = await Product.findById(productFK);
    if (!product) {
      return res.status(400).json({ message: "Product not found" });
    }

    const newDish = new DishOfTheDay({
      date,
      statut: statut || "Active",
      productFK,
    });

    const savedDish = await newDish.save();

    const populatedDish = await DishOfTheDay.findById(savedDish._id).populate({
      path: "productFK",
      populate: [
        { path: "categoryFK", select: "libelle" },
        {
          path: "recipeFK",
          populate: [
            {
              path: "ingredientsGroup.items.ingredient",
              select: "libelle photo qtMax",
            },
            {
              path: "utensils",
              select: "libelle quantity disponibility photo",
            },
            { path: "variants", select: "name portions images" },
          ],
        },
      ],
    });

    res.status(201).json(populatedDish);
  } catch (error) {
    console.error("Error creating Dish of the Day:", error);
    res.status(400).json({
      message: "Error creating Dish of the Day",
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /dish:
 *   get:
 *     summary: Retrieve all dishes of the day
 *     tags: [DishOfTheDay]
 *     responses:
 *       200:
 *         description: List of all dishes of the day
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DishOfTheDay'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", async (req, res) => {
  try {
    const dishes = await DishOfTheDay.find()
      .populate({
        path: "productFK",
        populate: [
          { path: "categoryFK", select: "libelle" },
          {
            path: "recipeFK",
            populate: [
              {
                path: "ingredientsGroup.items.ingredient",
                select: "libelle photo qtMax",
              },
              {
                path: "utensils",
                select: "libelle quantity disponibility photo",
              },
              { path: "variants", select: "name portions images" },
            ],
          },
        ],
      })
      .sort({ date: -1 });

    res.status(200).json(dishes);
  } catch (error) {
    console.error("Error fetching Dishes of the Day:", error);
    res.status(500).json({
      message: "Error fetching Dishes of the Day",
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /dish/{id}:
 *   put:
 *     summary: Update a dish of the day
 *     tags: [DishOfTheDay]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier of the dish of the day
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Date the dish is featured
 *                 example: "2024-05-04"
 *               statut:
 *                 type: string
 *                 description: Status of the dish
 *                 example: Active
 *               productFK:
 *                 type: string
 *                 description: ID of the associated product
 *     responses:
 *       200:
 *         description: Dish of the day updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DishOfTheDay'
 *       400:
 *         description: Invalid data or product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Dish of the day not found
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
router.put("/:id", async (req, res) => {
  try {
    const { date, statut, productFK } = req.body;

    const updateData = {};
    if (date) updateData.date = date;
    if (statut) updateData.statut = statut;
    if (productFK) {
      const product = await Product.findById(productFK);
      if (!product) {
        return res.status(400).json({ message: "Product not found" });
      }
      updateData.productFK = productFK;
    }

    const updatedDish = await DishOfTheDay.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    ).populate({
      path: "productFK",
      populate: [
        { path: "categoryFK", select: "libelle" },
        {
          path: "recipeFK",
          populate: [
            {
              path: "ingredientsGroup.items.ingredient",
              select: "libelle photo qtMax",
            },
            {
              path: "utensils",
              select: "libelle quantity disponibility photo",
            },
            { path: "variants", select: "name portions images" },
          ],
        },
      ],
    });

    if (!updatedDish) {
      return res.status(404).json({ message: "Dish of the Day not found" });
    }

    res.status(200).json(updatedDish);
  } catch (error) {
    console.error("Error updating Dish of the Day:", error);
    res.status(500).json({
      message: "Error updating Dish of the Day",
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /dish/{id}:
 *   delete:
 *     summary: Delete a dish of the day
 *     tags: [DishOfTheDay]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier of the dish of the day
 *     responses:
 *       200:
 *         description: Dish of the day deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Confirmation message
 *       404:
 *         description: Dish of the day not found
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
    const dish = await DishOfTheDay.findByIdAndDelete(req.params.id);
    if (!dish) {
      return res.status(404).json({ message: "Dish of the Day not found" });
    }

    res.status(200).json({ message: "Dish of the Day deleted successfully" });
  } catch (error) {
    console.error("Error deleting Dish of the Day:", error);
    res.status(500).json({
      message: "Error deleting Dish of the Day",
      error: error.message,
    });
  }
});

module.exports = router;