const express = require("express");
const router = express.Router();
const ingredientRoutes = require("./routes/ingredientRoutes");
const { verifyToken } = require("../../middlewares/authMiddleware");
// router.use("/", verifyToken, ingredientRoutes);
router.use("/", ingredientRoutes);
module.exports = router;
