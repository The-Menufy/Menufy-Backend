const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
// const { authenticateToken } = require("../middleware/auth");
// Public routes
router.post("/", userController.createUser);
// Protected routes
// router.use(authenticateToken);
router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

module.exports = router;
