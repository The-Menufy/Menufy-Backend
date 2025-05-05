const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Menufy API Documentation",
      version: "1.0.0",
      description: "Comprehensive documentation for the Menufy backend API.",
    },
    servers: [
      {
        url: "http://localhost:5000", // Change if needed
      },
    ],
  },
  apis: [
    "./src/modules/**/*.js", // <-- Make sure this matches your routes!
    "./src/routes/*.js",
  ],
};

const swaggerSpec = swaggerJSDoc(options);

function setupSwagger(app) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
}

module.exports = setupSwagger;
