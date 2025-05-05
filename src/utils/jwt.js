const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";
const REFRESH_TOKEN_SECRET =
	process.env.REFRESH_TOKEN_SECRET || "your-refresh-secret-key";
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";
const generateAccessToken = (payload) => {
	try {
		return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
	} catch (error) {
		throw new Error("Error generating access token");
	}
};
const generateRefreshToken = (payload) => {
	try {
		return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
			expiresIn: REFRESH_TOKEN_EXPIRES_IN,
		});
	} catch (error) {
		throw new Error("Error generating refresh token");
	}
};
const verifyAccessToken = (token) => {
	try {
		return jwt.verify(token, JWT_SECRET);
	} catch (error) {
		if (error.name === "TokenExpiredError") {
			throw new Error("Token has expired");
		}
		throw new Error("Invalid token");
	}
};
const verifyRefreshToken = (token) => {
	try {
		return jwt.verify(token, REFRESH_TOKEN_SECRET);
	} catch (error) {
		if (error.name === "TokenExpiredError") {
			throw new Error("Refresh token has expired");
		}
		throw new Error("Invalid refresh token");
	}
};
const refreshTokens = (refreshToken) => {
	try {
		const payload = verifyRefreshToken(refreshToken);
		delete payload.iat;
		delete payload.exp;
		const newAccessToken = generateAccessToken(payload);
		const newRefreshToken = generateRefreshToken(payload);
		return {
			accessToken: newAccessToken,
			refreshToken: newRefreshToken,
		};
	} catch (error) {
		throw new Error("Error refreshing tokens");
	}
};
const extractTokenFromHeader = (header) => {
	if (!header || !header.startsWith("Bearer ")) {
		throw new Error("No token provided");
	}
	return header.split(" ")[1];
};
module.exports = {
	generateAccessToken,
	generateRefreshToken,
	verifyAccessToken,
	verifyRefreshToken,
	refreshTokens,
	extractTokenFromHeader,
	JWT_SECRET,
	REFRESH_TOKEN_SECRET,
};
