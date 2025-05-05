const mongoose = require("mongoose");
const User = require("./user");
const employeeSchema = new mongoose.Schema({
	salary: {
		type: Number,
		required: true,
		min: 0,
	},
	restaurant: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Restaurant",
		required: true,
	},
});
const Employee = User.discriminator("Employee", employeeSchema);
module.exports = Employee;
