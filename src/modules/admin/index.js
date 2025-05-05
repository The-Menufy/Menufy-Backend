const express = require("express");
const router = express.Router();
const adminRoutes = require("./routes/adminRoute");
router.use("/", adminRoutes);

module.exports = router;
