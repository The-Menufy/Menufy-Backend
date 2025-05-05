const bcrypt = require("bcrypt");
const SALT_ROUNDS = 10;
const hashPassword = async (password) => {
	try {
		const salt = await bcrypt.genSalt(SALT_ROUNDS);
		const hashedPassword = await bcrypt.hash(password, salt);
		return hashedPassword;
	} catch (error) {
		throw new Error("Password hashing failed");
	}
};
const comparePassword = async (password, hashedPassword) => {
	try {
		return await bcrypt.compare(password, hashedPassword);
	} catch (error) {
		throw new Error("Password comparison failed");
	}
};
module.exports = {
	hashPassword,
	comparePassword,
};
