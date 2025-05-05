const express = require("express");
const router = express.Router();
const loginRoutes = require("./loginRoutes");
const deviceRoutes = require("./deviceRoutes");
const signupRoutes = require("./signupRoutes");
const profileRoutes = require("./profileRoutes");

router.use("/login", loginRoutes);
router.use("/devices", deviceRoutes);
router.use("/signup", signupRoutes);
router.use("/profile", profileRoutes);
module.exports = router;
