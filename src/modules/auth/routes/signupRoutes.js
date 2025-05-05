const express = require("express");
const SignupController = require("../controllers/signupController");
const router = express.Router();

router.post("/", SignupController.register);

module.exports = router;
