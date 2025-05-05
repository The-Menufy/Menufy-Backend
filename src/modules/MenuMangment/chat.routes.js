/**
 * @swagger
 * tags:
 *   - name: Chat
 *     description: AI-powered chat for restaurant owners
 */

/**
 * @swagger
 * /chat/chat:
 *   post:
 *     summary: Posez une question à l'assistant IA spécialisé en restauration.
 *     tags: [Chat]
 *     requestBody:
 *       description: Message envoyé par l'utilisateur (ex: idée de menu, conseil en gestion, tendance, etc.)
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: "Donne-moi une idée de plat végétarien pour le printemps"
 *     responses:
 *       200:
 *         description: Réponse générée par l'IA (texte)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Voici une idée de plat végétarien printanier : salade de quinoa aux asperges, pois gourmands, et vinaigrette citronnée."
 *       500:
 *         description: Erreur lors de la génération de la réponse
 */
const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Stocker l'historique des messages (optionnel)
let conversationHistory = [];

// Fonction pour filtrer (ex: ici, pas de filtre car on accepte toutes les questions liées à la restauration)
const isRestaurantQuestion = (message) => {
  const keywords = [
    "menu",
    "plat",
    "recette",
    "boisson",
    "client",
    "service",
    "tendance",
    "restaurant",
    "gastronomie",
    "bio",
    "végétarien",
    "cuisine",
    "nutrition",
    "saison",
    "décoration",
  ];
  return keywords.some((keyword) => message.toLowerCase().includes(keyword));
};

router.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    const prompt = `
Tu es un assistant virtuel spécialisé pour les propriétaires de restaurants.
Tu aides à générer des idées de plats, de menus, à suivre les tendances culinaires, à améliorer l'expérience client, et à optimiser la gestion d’un restaurant.

Réponds uniquement aux questions liées à la cuisine, à la gestion de restaurant, au marketing culinaire, à l’organisation d’un menu, ou à l’innovation dans la restauration.

Si la question ne concerne pas ces domaines, réponds : "Je suis spécialisé en restauration et je ne peux répondre qu'à des questions liées à ce domaine."

Utilisateur : ${userMessage}
Réponse :
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiMessage = await response.text();

    res.json({ message: aiMessage });
  } catch (error) {
    console.error("Erreur:", error);
    res
      .status(500)
      .send("Erreur lors de la génération de la réponse : " + error.message);
  }
});

module.exports = router;
