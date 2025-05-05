const express = require("express");
const router = express.Router();
const restaurantController = require("../controllers/restaurantController");
const authMiddleware = require("@middlewares/authMiddleware");
const restaurantOwnerCheck = require("../../../middlewares/restaurantOwnerCheck");
// const { authenticateToken } = require("../middleware/auth");

// Routes publiques
router.post("/", restaurantController.createRestaurant);

// Routes protégées (ajoute authenticateToken si nécessaire)
// router.use(authenticateToken);
router.get("/", restaurantController.getAllRestaurants);
router.get("/:id", restaurantController.getRestaurantById);
router.put(
  "/:id",
  authMiddleware.verifyToken,
  restaurantOwnerCheck,
  restaurantController.updateRestaurant
);
router.delete(
  "/:id",
  authMiddleware.verifyToken,
  restaurantOwnerCheck,
  restaurantController.deleteRestaurant
);

module.exports = router;
