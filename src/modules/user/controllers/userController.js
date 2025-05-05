const { userService } = require("../services");
const { userSchema } = require("../validators/userValidator");
const yup = require("yup");
class UserController {
  async createUser(req, res) {
    try {
      await userSchema.validate(req.body, { abortEarly: false });
      const result = await userService.createUser(req.body);
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
        message: error.message || "Error creating user",
      });
    }
  }
  async getAllUsers(req, res) {
    try {
      const users = await userService.getAllUsers();
      return res.status(200).json({
        success: true,
        data: users,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || "Error fetching users",
      });
    }
  }
  async getUserById(req, res) {
    try {
      const user = await userService.getUserById(req.params.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
      return res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || "Error fetching user",
      });
    }
  }
  async updateUser(req, res) {
    try {
      await userSchema.validate(req.body, { abortEarly: false });
      const updatedUser = await userService.updateUser(req.params.id, req.body);
      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
      return res.status(200).json({
        success: true,
        data: updatedUser,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || "Error updating user",
      });
    }
  }
  async deleteUser(req, res) {
    try {
      const result = await userService.deleteUser(req.params.id);
      if (!result) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
      return res.status(200).json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || "Error deleting user",
      });
    }
  }
}
module.exports = new UserController();
