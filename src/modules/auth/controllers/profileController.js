const profileService = require("../services/profileService");
const { profileUpdateSchema } = require("../validators/profileValidator");

const updateProfile = async (req, res) => {
  try {
    const { userId } = req.user;
    let updateData = req.body;
    updateData = profileUpdateSchema.validateSync(updateData, {
      stripUnknown: true,
    });
    const updatedProfile = await profileService.updateProfile(
      userId,
      updateData
    );
    res.status(200).json({
      success: true,
      data: updatedProfile,
      message: "profile updated ! ",
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updatePassword = async (req, res) => {
  try {
    console.log("🔍 Password update request received:", req.body);

    const { userId } = req.user;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from current password",
      });
    }

    await profileService.updatePassword(userId, {
      currentPassword,
      newPassword,
    });

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Backend error:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  updateProfile,
  updatePassword,
};
