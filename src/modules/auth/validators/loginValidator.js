const yup = require("yup");
// Validation schemas
const emailPasswordSchema = yup.object({
	email: yup
		.string()
		.email("Invalid email format")
		.required("Email is required"),
	password: yup
		.string()
		.min(6, "Password must be at least 6 characters")
		.required("Password is required"),
	deviceId: yup.string().required("Device ID is required"),
});
const googleSchema = yup.object({
	tokenId: yup.string().required("Google token is required"),
	deviceId: yup.string().required("Device ID is required"),
});
const facebookSchema = yup.object({
	accessToken: yup.string().required("Facebook access token is required"),
	deviceId: yup.string().required("Device ID is required"),
});
module.exports = {
	emailPasswordSchema,
	googleSchema,
	facebookSchema,
};
