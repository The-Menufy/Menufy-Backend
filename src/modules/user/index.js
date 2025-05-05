const express = require("express");
const router = express.Router();
const userRoutes = require("./routes/index");
// Use authentication routes under /api/auth
router.use("/", userRoutes);
module.exports = router;
