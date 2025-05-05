const { loginService } = require("../services");
const {
  emailPasswordSchema,
  facebookSchema,
  googleSchema,
} = require("../validators/loginValidator");
const yup = require("yup");
class LoginController {
  // Handle email/password login
  async loginWithEmailPassword(req, res) {
    try {
      // Validate request body
      await emailPasswordSchema.validate(req.body, { abortEarly: false });
      const { email, password, deviceId } = req.body;
      const result = await loginService.loginWithEmailPassword(
        email,
        password,
        deviceId
      );
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error.errors,
        });
      }
      return res.status(401).json({
        success: false,
        message: error.message || "Authentication failed",
      });
    }
  }
  // Handle Google login
  async loginWithGoogle(req, res) {
    try {
      // Validate request body
      await googleSchema.validate(req.body, { abortEarly: false });
      const { tokenId, deviceId } = req.body;
      const result = await loginService.loginWithGoogle(tokenId, deviceId);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error.errors,
        });
      }
      return res.status(401).json({
        success: false,
        message: error.message || "Google authentication failed",
      });
    }
  }
  // Handle Facebook login
  async loginWithFacebook(req, res) {
    try {
      // Validate request body
      await facebookSchema.validate(req.body, { abortEarly: false });
      const { accessToken, deviceId } = req.body;
      const result = await loginService.loginWithFacebook(
        accessToken,
        deviceId
      );
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error.errors,
        });
      }
      return res.status(401).json({
        success: false,
        message: error.message || "Facebook authentication failed",
      });
    }
  }
  // Handle email verification
  async verifyEmail(req, res) {
    try {
      const { token } = req.params;
      const result = await loginService.verifyEmail(token);
      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || "Email verification failed",
      });
    }
  }
  // Handle device verification
  async verifyDevice(req, res) {
    try {
      const { token } = req.params;
      const result = await loginService.verifyEmailForDevice(token);
      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || "Device verification failed",
      });
    }
  }
  // Handle Profile
  async getProfile(req, res) {
    try {
      const { userId, deviceId } = req.user;

      if (!deviceId) {
        return res.status(400).json({
          success: false,
          message: "Device ID is required",
        });
      }
      console.log(
        "🔍 ~ getProfile ~ src/modules/auth/controllers/userController.js:106 ~ deviceId:",
        deviceId
      );

      const profile = await loginService.getProfile(userId, deviceId);

      return res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: error.message || "Error fetching profile",
      });
    }
  }
}
module.exports = new LoginController();
