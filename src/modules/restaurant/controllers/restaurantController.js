const { restaurantService } = require("../services");
const { restaurantSchema } = require("../validators/restaurantvalidators");
const yup = require("yup");

class RestaurantController {
  async createRestaurant(req, res) {
    try {
      await restaurantSchema.validate(req.body, { abortEarly: false });
      const result = await restaurantService.createRestaurant(req.body);
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
        message: error.message || "Error creating restaurant",
      });
    }
  }

  async getAllRestaurants(req, res) {
    try {
      const restaurants = await restaurantService.getAllRestaurants();
      return res.status(200).json({
        success: true,
        data: restaurants,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || "Error fetching restaurants",
      });
    }
  }

  async getRestaurantById(req, res) {
    try {
      const restaurant = await restaurantService.getRestaurantById(req.params.id);
      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message: "Restaurant not found",
        });
      }
      return res.status(200).json({
        success: true,
        data: restaurant,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || "Error fetching restaurant",
      });
    }
  }

  async updateRestaurant(req, res) {
    try {
      await restaurantSchema.validate(req.body, { abortEarly: false });
      const updatedRestaurant = await restaurantService.updateRestaurant(req.params.id, req.body);
      if (!updatedRestaurant) {
        return res.status(404).json({
          success: false,
          message: "Restaurant not found",
        });
      }
      return res.status(200).json({
        success: true,
        data: updatedRestaurant,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || "Error updating restaurant",
      });
    }
  }

  async deleteRestaurant(req, res) {
    try {
      const result = await restaurantService.deleteRestaurant(req.params.id);
      if (!result) {
        return res.status(404).json({
          success: false,
          message: "Restaurant not found",
        });
      }
      return res.status(200).json({
        success: true,
        message: "Restaurant deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || "Error deleting restaurant",
      });
    }
  }
}

module.exports = new RestaurantController();
