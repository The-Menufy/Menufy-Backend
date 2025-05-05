const { hashPassword } = require("../../../utils/hash");
const User = require("../../../models/user");
const bcrypt = require("bcrypt");
class UserService {
  async createUser(userData) {
    const { password, ...otherData } = userData;
    const hashedPassword = await hashPassword(password);
    const user = new User({
      ...otherData,
      password: hashedPassword,
    });
    await user.save();
    const { password: _, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword;
  }
  async getAllUsers() {
    const users = await User.find({}, { password: 0 }).populate(["restaurant"]);
    return users;
  }
  async getUserById(id) {
    const user = await User.findById(id, { password: 0 }).populate([
      "restaurant",
    ]);
    return user;
  }
  async updateUser(id, updateData) {
    if (updateData.password) {
      updateData.password = await hashPassword(updateData.password);
    }
    const user = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, select: "-password" }
    ).populate(["restaurant"]);
    return user;
  }
  async deleteUser(id) {
    const result = await User.findByIdAndDelete(id).populate(["restaurant"]);
    return result;
  }
  async getUserByEmail(email) {
    const user = await User.findOne({ email }).populate(["restaurant"]);
    return user;
  }
}
module.exports = new UserService();
