const express = require("express");
const router = express.Router();
const deviceController = require("../controllers/deviceController");
const { verifyToken } = require("../../../middlewares/authMiddleware");

router.delete("/", verifyToken, deviceController.removeDevices);
router.get("/:deviceId", verifyToken, deviceController.checkDevice);

module.exports = router;
