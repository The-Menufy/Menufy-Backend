const userService = require("../../user/services/userService");
const deviceService = require("../services/deviceService");

class DeviceController {
  async removeDevices(req, res) {
    try {
      const { devices } = req.body;
      const { userId } = req.user;

      if (!Array.isArray(devices)) {
        return res.status(400).json({
          success: false,
          message: "Devices must be an array",
        });
      }

      const remainingDevices = await deviceService.removeDevices(
        userId,
        devices
      );

      return res.status(200).json({
        success: true,
        message: "Devices removed successfully",
        remainingDevices,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || "Error removing devices",
      });
    }
  }
  async checkDevice(req, res) {
    try {
      const { deviceId } = req.params;
      const { userId } = req.user;

      const result = await deviceService.checkDevice(userId, deviceId);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || "Error checking device status",
      });
    }
  }
}

module.exports = new DeviceController();
