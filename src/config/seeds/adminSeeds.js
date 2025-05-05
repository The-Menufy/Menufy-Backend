const { restaurant1Id, restaurant2Id } = require("./restaurantSeeds");

const admins = [
  {
    firstName: "Admin",
    lastName: "User",
    email: "admin@menufy.com",
    password: "Admin@123",
    phone: "5141234567",
    address: "123 Admin Street, Montreal, QC",
    birthday: "1985-01-01",
    role: "admin",
    isEmailVerified: true,
    authProvider: "local",
    restaurant: restaurant1Id,
    verifiedDevices: ["admin_device_1"],
  },
  {
    firstName: "Manager",
    lastName: "Admin",
    email: "manager@menufy.com",
    password: "Manager@123",
    phone: "5147654321",
    address: "456 Manager Ave, Montreal, QC",
    birthday: "1988-06-15",
    role: "admin",
    isEmailVerified: true,
    restaurant: restaurant2Id,
    authProvider: "local",
    verifiedDevices: ["admin_device_2"],
  },
];

module.exports = admins;
