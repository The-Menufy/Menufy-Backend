/**
 * @swagger
 * tags:
 *   - name: Admin
 *     description: Gestion des administrateurs de restaurant
 *
 * components:
 *   schemas:
 *     Admin:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           readOnly: true
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         email:
 *           type: string
 *         password:
 *           type: string
 *         phone:
 *           type: string
 *         address:
 *           type: string
 *         birthday:
 *           type: string
 *           format: date
 *         archived:
 *           type: boolean
 *     AdminCreate:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *         - password
 *       properties:
 *         firstName:
 *           type: string
 *           example: John
 *         lastName:
 *           type: string
 *           example: Doe
 *         email:
 *           type: string
 *           example: john.doe@example.com
 *         password:
 *           type: string
 *           example: Test@123
 *         phone:
 *           type: string
 *           example: "5141234567"
 *         address:
 *           type: string
 *           example: "123 Main St, Montreal, QC"
 *         birthday:
 *           type: string
 *           format: date
 *           example: "1990-01-15"
 *     AdminSignupResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Inscription réussie. Vous pouvez maintenant vous connecter."
 *     AdminSignupErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Cet email est déjà utilisé."
 *         errors:
 *           type: array
 *           items:
 *             type: string
 *           example:
 *             - "First name is required"
 *             - "Last name is required"
 *             - "Password is required"
 *             - "email must be a valid email"
 */

/**
 * @swagger
 * /api/admin/signup:
 *   post:
 *     summary: Inscrire un nouvel administrateur
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminCreate'
 *           example:
 *             firstName: John
 *             lastName: Doe
 *             email: john.doe@example.com
 *             password: Test@123
 *             phone: "5141234567"
 *             address: "123 Main St, Montreal, QC"
 *             birthday: "1990-01-15"
 *     responses:
 *       201:
 *         description: Inscription réussie
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminSignupResponse'
 *       400:
 *         description: Erreur de validation ou email déjà utilisé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminSignupErrorResponse'
 *       500:
 *         description: Erreur serveur lors de l'inscription
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Erreur lors de l'inscription."
 */

const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const signupController = require("../../auth/controllers/signupController");

router.post("/signup", signupController.register); // signup route
router.get("/restaurant/:restaurantId", adminController.getAllAdmins);
router.get("/:id", adminController.getAdmin);
router.post("/", adminController.createAdmin);
router.put("/:id", adminController.updateAdmin);
router.delete("/:id", adminController.deleteAdmin);

module.exports = router;
