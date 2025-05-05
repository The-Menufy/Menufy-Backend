const express = require("express");
const router = express.Router();
const restaurantRoutes = require("./routes");
router.use("/", restaurantRoutes);
module.exports = router;
