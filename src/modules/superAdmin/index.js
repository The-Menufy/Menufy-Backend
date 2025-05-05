const express = require("express");
const router = express.Router();
const superadminRoutes = require("./routes/superadminRoutes");
router.use("/", superadminRoutes);
module.exports = router;
