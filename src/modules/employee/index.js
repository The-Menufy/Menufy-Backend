const express = require("express");
const router = express.Router();
const employeeRoutes = require("./routes/employeeRoutes");
router.use("/", employeeRoutes);
module.exports = router;
