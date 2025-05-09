require("dotenv").config();
require("module-alias/register");
const express = require("express");
const connectDB = require("./config/db");
const listEndpoints = require("express-list-endpoints");
const cors = require("cors");
const app = express();
const path = require("path");
const mongoose = require("mongoose"); // Ajout nécessaire
const recommendationRoute = require("./modules/recommendationRoute");
const recipeIngredientRoutes = require("./modules/recipeIngredient.routes");
const analyzeNutritionRoute = require("./modules/Nutrition/analyzeNutrition");
const recipeVariantRoutes = require("./modules/MenuMangment/recipeVariantRoutes");
const setupSwagger = require("./swagger"); // Adjust path if needed
require('dotenv').config();
const PORT = process.env.PORT || 5000;

// 🔗 Connexion à MongoDB
connectDB();

setupSwagger(app); // <-- Add this before app.listen

// ✅ Middlewares
app.use(cors({ origin: "*", methods: "*", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//app.use("/uploads", express.static("uploads")); // Serve the uploads directory
// ✅ Static Files
//app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Routes
app.use("/api/auth", require("@modules/auth/routes"));
app.use("/api/user", require("@modules/user/routes"));
app.use("/api/employee", require("@modules/employee"));
app.use("/api/superadmins", require("@modules/superAdmin"));
app.use("/api/restaurant", require("@modules/restaurant"));
app.use("/api/admin", require("@modules/admin"));
app.use("/api/ingredient", require("@modules/ingredient"));
app.use("/menu", require("./modules/MenuMangment/menu.routes"));
app.use("/category", require("./modules/MenuMangment/category.routes"));
app.use("/product", require("./modules/MenuMangment/product.routes"));
app.use("/ingredient", require("./modules/MenuMangment/ingredient.routes"));
app.use("/ustensile", require("./modules/MenuMangment/ustensile"));
app.use("/dish", require("./modules/MenuMangment/dish.routes"));
app.use("/api/recommendation", recommendationRoute);
app.use("/api/recipe", require("./modules/MenuMangment/recipeRoutes"));
app.use("/chat", require("./modules/MenuMangment/chat.routes"));
app.use("/api/recipe-ingredients", recipeIngredientRoutes);
app.use("/api/nutrition", analyzeNutritionRoute);
app.use("/api/recipe-variants", recipeVariantRoutes); // Register routes
// ✅ Route API pour récupérer les messages
app.get("/api/messages", async (req, res) => {
  const { user1, user2 } = req.query;
  const Message = mongoose.model("Message");

  const messages = await Message.find({
    $or: [
      { sender: user1, receiver: user2 },
      { sender: user2, receiver: user1 },
    ],
  }).sort("createdAt");

  res.json(messages);
});

// ✅ Serveur HTTP + WebSocket
const http = require("http");
const { initSocket } = require("./config/socket");
const server = http.createServer(app);
initSocket(server);

// ✅ Lancer le serveur
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  logAvailableRoutes();
});

// ✅ Fonction pour lister les routes
const logAvailableRoutes = () => {
  const routes = listEndpoints(app);
  const moduleRoutes = {};
  routes.forEach((route) => {
    const moduleName = route.path.split("/")[2];
    if (!moduleRoutes[moduleName]) {
      moduleRoutes[moduleName] = [];
    }
    moduleRoutes[moduleName].push({
      method: route.methods.join(","),
      path: route.path,
    });
  });
  console.clear();
  console.log("\n📍 API Routes by Module:");
  Object.keys(moduleRoutes).forEach((module) => {
    console.log(`\n🔹 ${module.toUpperCase()} Module:`);
    moduleRoutes[module].forEach((route) => {
      console.log(`\t⚡${route.method} http://localhost:${PORT}${route.path}`);
    });
  });
};

module.exports = app;
