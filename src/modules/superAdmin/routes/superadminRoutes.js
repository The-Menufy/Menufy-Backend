const express = require("express");
const router = express.Router();
const superAdminController = require("../controllers/superadminController");

router.post("/", superAdminController.createSuperAdmin);
router.get("/", superAdminController.getAllSuperAdmins);
router.get("/:id", superAdminController.getSuperAdminById);
router.put("/:id", superAdminController.updateSuperAdmin);
router.delete("/:id", superAdminController.deleteSuperAdmin);
//router.post("/login", superAdminController.login);

module.exports = router;
