const { ingredientSchema } = require("../validators/ingredientValidator");
const ingredientService = require("../services/ingredientService");
const yup = require("yup");

class IngredientController {
  async createIngredient(req, res) {
    try {
      await ingredientSchema.validate(req.body, { abortEarly: false });
      const result = await ingredientService.createIngredient(req.body);
      return res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error.errors,
        });
      }
      return res.status(500).json({
        success: false,
        message: error.message || "Error creating ingredient",
      });
    }
  }

  async getAllIngredients(req, res) {
    try {
      const ingredients = await ingredientService.getAllIngredients();
      return res.status(200).json({
        success: true,
        data: ingredients,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || "Error fetching ingredients",
      });
    }
  }

  async getIngredientById(req, res) {
    try {
      const ingredient = await ingredientService.getIngredientById(req.params.id);
      if (!ingredient) {
        return res.status(404).json({
          success: false,
          message: "Ingredient not found",
        });
      }
      return res.status(200).json({
        success: true,
        data: ingredient,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || "Error fetching ingredient",
      });
    }
  }

  async updateIngredient(req, res) {
    try {
      await ingredientSchema.validate(req.body, { abortEarly: false });
      const updatedIngredient = await ingredientService.updateIngredient(
        req.params.id,
        req.body
      );
      if (!updatedIngredient) {
        return res.status(404).json({
          success: false,
          message: "Ingredient not found",
        });
      }
      return res.status(200).json({
        success: true,
        data: updatedIngredient,
      });
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error.errors,
        });
      }
      return res.status(500).json({
        success: false,
        message: error.message || "Error updating ingredient",
      });
    }
  }

  async deleteIngredient(req, res) {
    try {
      const result = await ingredientService.deleteIngredient(req.params.id);
      if (!result) {
        return res.status(404).json({
          success: false,
          message: "Ingredient not found",
        });
      }
      return res.status(200).json({
        success: true,
        message: "Ingredient deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || "Error deleting ingredient",
      });
    }
  }

  async increaseQuantity(req, res) {
    try {
      const { amount } = req.body;
      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: "Valid amount is required",
        });
      }

      const ingredient = await ingredientService.increaseQuantity(req.params.id, amount);
      return res.status(200).json({
        success: true,
        data: ingredient,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || "Error updating ingredient quantity",
      });
    }
  }

  async decreaseQuantity(req, res) {
    try {
      const { amount } = req.body;
      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: "Valid amount is required",
        });
      }

      const ingredient = await ingredientService.decreaseQuantity(req.params.id, amount);
      return res.status(200).json({
        success: true,
        data: ingredient,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || "Error updating ingredient quantity",
      });
    }
  }
}

const ingredientController = new IngredientController();
module.exports = ingredientController;