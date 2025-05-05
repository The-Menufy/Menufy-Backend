const yup = require("yup");
const userSchema = yup.object({
	firstName: yup.string().required("First name is required").trim(),
	lastName: yup.string().required("Last name is required").trim(),
	email: yup
		.string()
		.email("Invalid email")
		.required("Email is required")
		.trim()
		.lowercase(),
	password: yup
		.string()
		.min(6, "Password must be at least 6 characters")
		.required("Password is required"),
	image: yup.string().nullable(),
	phone: yup.string().nullable(),
	address: yup.string().min(3).nullable(),
	birthday: yup.date().nullable(),
	isEmailVerified: yup.boolean().default(false),
	verifiedDevices: yup.array().of(yup.string()).default([]),
	authProvider: yup
		.string()
		.oneOf(["local", "google", "facebook"])
		.default("local"),
});
module.exports = {
	userSchema,
};
