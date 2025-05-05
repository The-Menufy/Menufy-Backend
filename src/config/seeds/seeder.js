require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../../models/user");
const Admin = require("../../models/admin");
const Employee = require("../../models/employee");
const Restaurant = require("../../models/restaurant");
const SuperAdmin = require("../../models/superAdmin");

// Import seed data
const users = require("./userSeeds");
const admins = require("./adminSeeds");
const { employees } = require("./employeeSeeds");
const { restaurants } = require("./restaurantSeeds");
const superAdmins = require("./superAdminSeeds");
const { hashPassword } = require("../../utils/hash");

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB...");

    // Clear existing data
    await User.deleteMany({});
    await Restaurant.deleteMany({});
    await Employee.deleteMany({});
    await Admin.deleteMany({});
    await SuperAdmin.deleteMany({});
    console.log("Cleared existing data...");

    // Create restaurants first
    const createdRestaurants = await Restaurant.insertMany(restaurants);
    console.log("Restaurants seeded successfully!");

    // Hash passwords and prepare user data
    const usersWithHashedPasswords = await Promise.all(
      users.map(async (user) => ({
        ...user,
        password: await hashPassword(user.password),
      }))
    );

    // Create regular users
    await User.insertMany(usersWithHashedPasswords);
    console.log("Users seeded successfully!");

    // Create admins
    const adminsWithHashedPasswords = await Promise.all(
      admins.map(async (admin) => ({
        ...admin,
        password: await hashPassword(admin.password),
      }))
    );
    await Admin.insertMany(adminsWithHashedPasswords);
    console.log("Admins seeded successfully!");

    // Create super admins
    const superAdminsWithHashedPasswords = await Promise.all(
      superAdmins.map(async (superAdmin) => ({
        ...superAdmin,
        password: await hashPassword(superAdmin.password),
      }))
    );
    await SuperAdmin.insertMany(superAdminsWithHashedPasswords);
    console.log("Super admins seeded successfully!");

    // Prepare and create employees with restaurant references
    const employeesWithHashedPasswords = await Promise.all(
      employees.map(async (employee, index) => ({
        ...employee,
        password: await hashPassword(employee.password),
        restaurantFK: createdRestaurants[index % createdRestaurants.length]._id,
      }))
    );

    await Employee.insertMany(employeesWithHashedPasswords);
    console.log("Employees seeded successfully!");

    await mongoose.disconnect();
    console.log("Database seeding completed!");
    console.log("Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
