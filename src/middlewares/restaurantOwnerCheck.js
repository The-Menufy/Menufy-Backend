const adminService = require("@modules/admin/services/adminService");
async function restaurantOwnerCheck(req, res, next) {
  try {
    const { data: admin } = await adminService.getAdminById(req.user.userId);
    if (admin.restaurant._id == req.params.id) {
      next();
    } else {
      throw new Error("Unauthorized");
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
module.exports = restaurantOwnerCheck;
