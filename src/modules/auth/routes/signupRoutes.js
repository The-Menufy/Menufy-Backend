/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserSignup'
 *     responses:
 *       201:
 *         description: User created
 */
const express = require("express");
const SignupController = require("../controllers/signupController");
const router = express.Router();

router.post("/", SignupController.register);

module.exports = router;
