const userService = require("../../user/services/userService");

class DeviceService {
  async removeDevices(userId, deviceIds) {
    const user = await userService.getUserById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    user.verifiedDevices = user.verifiedDevices.filter(
      (device) => !deviceIds.includes(device)
    );
    await user.save();

    return user.verifiedDevices;
  }
  async checkDevice(userId, deviceId) {
    const user = await userService.getUserById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    return {
      isVerified: user.verifiedDevices.includes(deviceId),
      deviceId,
    };
  }
}

module.exports = new DeviceService();
