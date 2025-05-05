const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const { verifyToken } = require("../../../middlewares/authMiddleware");

// Get user profile
// router.get("/profile", profileController.getProfile);

// Update user profile
router.put("/", verifyToken, profileController.updateProfile);
router.put("/password", verifyToken, profileController.updatePassword);

module.exports = router;
