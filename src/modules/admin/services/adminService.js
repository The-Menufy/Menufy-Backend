const Admin = require("../../../models/admin");

class AdminService {
  // Fetch all admins for a restaurant
  async getAllAdmins(restaurantId) {
    try {
      const admins = await Admin.find({ restaurant: restaurantId })
        .populate("restaurant")
        .select("-password");

      return {
        success: true,
        message: "Admins retrieved successfully",
        data: admins,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Get a specific admin by ID
  async getAdminById(id) {
    try {
      const admin = await Admin.findById(id)
        .populate("restaurant")
        .select("-password");

      if (!admin) {
        return {
          success: false,
          message: "Admin not found",
        };
      }

      return {
        success: true,
        message: "Admin retrieved successfully",
        data: admin,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Create a new admin
  async createAdmin(adminData) {
    try {
      const admin = new Admin({
        ...adminData,
        role: "admin", // Default role is admin
        isVerified: adminData.isVerified || false, // Default isVerified to false if not passed
      });

      await admin.save();

      const savedAdmin = await Admin.findById(admin._id)
        .populate("restaurant")
        .select("-password");

      return {
        success: true,
        message: "Admin created successfully",
        data: savedAdmin,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Update an existing admin by ID
  async updateAdmin(id, updateData) {
    try {
      const admin = await Admin.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
      )
        .populate("restaurant")
        .select("-password");

      if (!admin) {
        return {
          success: false,
          message: "Admin not found",
        };
      }

      return {
        success: true,
        message: "Admin updated successfully",
        data: admin,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Delete an admin by ID
  async deleteAdmin(id) {
    try {
      const admin = await Admin.findByIdAndDelete(id);

      if (!admin) {
        return {
          success: false,
          message: "Admin not found",
        };
      }

      return {
        success: true,
        message: "Admin deleted successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
}

module.exports = new AdminService();
