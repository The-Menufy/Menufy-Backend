const AdminService = require("../services/adminService");
const { adminSchema } = require("../validators/adminValidtor");

class adminController {
  // Get all admins for a specific restaurant
  async getAllAdmins(req, res) {
    try {
      // Fetch all admins based on restaurant ID
      const result = await AdminService.getAllAdmins(req.params.restaurantId);
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get a specific admin by ID
  async getAdmin(req, res) {
    try {
      // Fetch admin based on ID
      const result = await AdminService.getAdminById(req.params.id);
      res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Create a new admin
  async createAdmin(req, res) {
    try {
      // Validate the incoming request body using the admin validation schema
      await adminSchema.validate(req.body, { abortEarly: false });

      // Create the new admin using the validated data
      const result = await AdminService.createAdmin(req.body);

      // Return appropriate response based on success/failure
      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      if (error.name === "ValidationError") {
        // Handle validation errors specifically
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error.errors, // Send detailed validation errors
        });
      }

      // Handle other types of errors
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Update an existing admin by ID
  async updateAdmin(req, res) {
    try {
      // Update the admin with the provided data
      const result = await AdminService.updateAdmin(req.params.id, req.body);

      // Return success or not-found response based on whether the admin was found
      res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Delete an admin by ID
  async deleteAdmin(req, res) {
    try {
      // Delete the admin by ID
      const result = await AdminService.deleteAdmin(req.params.id);

      // Return success or not-found response
      res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new adminController();
