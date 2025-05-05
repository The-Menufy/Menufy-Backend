const User = require("../../../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs"); // Add this import at the top

class ProfileService {
  async updateProfile(userId, updateData) {
    try {
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true, runValidators: true }
      )
        .select(["-password"])
        .populate("restaurant");

      if (!updatedUser) {
        throw new Error("User not found");
      }

      return updatedUser;
    } catch (error) {
      if (error.name === "JsonWebTokenError") {
        throw new Error("Invalid token");
      }
      if (error.name === "TokenExpiredError") {
        throw new Error("Token expired");
      }
      throw error;
    }
  }

  async updatePassword(userId, { currentPassword, newPassword }) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Compare passwords using bcrypt directly
      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!isPasswordValid) {
        throw new Error("Current password is incorrect");
      }

      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update the password
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { password: hashedPassword },
        { new: true }
      );

      if (!updatedUser) {
        throw new Error("Failed to update password");
      }

      return {
        success: true,
        message: "Password updated successfully",
      };
    } catch (error) {
      console.error("Password update error:", error);
      throw new Error(error.message || "Failed to update password");
    }
  }
}

module.exports = new ProfileService();
