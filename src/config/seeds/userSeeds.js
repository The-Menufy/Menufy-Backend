const users = [
  {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    password: "Test@123",
    phone: 5141234567,
    address: "123 Main St, Montreal, QC",
    birthday: "1990-01-15",
    role: "admin",
    isEmailVerified: true,
    authProvider: "local",
    verifiedDevices: ["device_123"],
  },
  {
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@example.com",
    password: "Test@123",
    phone: 5149876543,
    address: "456 Oak Ave, Montreal, QC",
    birthday: "1992-05-20",
    role: "employee",
    isEmailVerified: true,
    authProvider: "local",
    verifiedDevices: ["device_456"],
  },
];

module.exports = users;
