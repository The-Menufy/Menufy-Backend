const mongoose = require("mongoose");
const User = require("./user");
const adminSchema = new mongoose.Schema({
	restaurant: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Restaurant",
		required: false, // Make restaurant optional
	},
	isVerified: {
		type: Boolean,
		required: true,
		default: false,
	},
});
// Inherit fields from User schema
const Admin = User.discriminator("Admin", adminSchema);
module.exports = Admin;
