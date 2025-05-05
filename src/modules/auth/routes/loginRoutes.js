const express = require("express");
const router = express.Router();
const loginController = require("../controllers/loginController");
const { verifyToken } = require("@middlewares/authMiddleware");
router.post("/email", loginController.loginWithEmailPassword);
router.post("/google", loginController.loginWithGoogle);
router.post("/facebook", loginController.loginWithFacebook);
router.get("/profile", verifyToken, loginController.getProfile);
router.get("/verify-email/:token", loginController.verifyEmail); // New verification route
router.get("/verify-device/:token", loginController.verifyDevice);
module.exports = router;
