const {
  restaurant1Id,
  restaurant2Id,
  restaurant3Id,
} = require("./restaurantSeeds");
const mongoose = require("mongoose");

const employee1Id = new mongoose.Types.ObjectId();
const employee2Id = new mongoose.Types.ObjectId();
const employee3Id = new mongoose.Types.ObjectId();

const employees = [
  {
    _id: employee1Id,
    firstName: "Robert",
    lastName: "Johnson",
    email: "robert.johnson@example.com",
    password: "Emp@123",
    phone: "5141112222",
    address: "321 Maple St, Montreal, QC",
    birthday: "1995-03-10",
    role: "employee",
    isEmailVerified: true,
    authProvider: "local",
    salary: 45000,
    restaurant: restaurant1Id,
  },
  {
    _id: employee2Id,
    firstName: "Maria",
    lastName: "Garcia",
    email: "maria.garcia@example.com",
    password: "Emp@456",
    phone: "5143334444",
    address: "654 Pine St, Montreal, QC",
    birthday: "1993-07-25",
    role: "employee",
    isEmailVerified: true,
    authProvider: "local",
    salary: 48000,
    restaurant: restaurant2Id,
  },
  {
    _id: employee3Id,
    firstName: "David",
    lastName: "Chen",
    email: "david.chen@example.com",
    password: "Emp@789",
    phone: "5145556666",
    address: "987 Oak St, Montreal, QC",
    birthday: "1991-11-30",
    role: "employee",
    isEmailVerified: true,
    authProvider: "local",
    salary: 52000,
    restaurant: restaurant3Id,
  },
];

module.exports = {
  employees,
  employee1Id,
  employee2Id,
  employee3Id,
};
