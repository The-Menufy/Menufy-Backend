const express = require("express");
const router = express.Router();
const authRoutes = require("./routes/index");
// Use authentication routes under /api/auth
router.use("/", authRoutes);
module.exports = router;
