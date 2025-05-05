const mongoose = require("mongoose");
const { Schema } = mongoose;
const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    // Removing the existing name field as it's split into firstName and lastName
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    image: {
      type: String,
      default:
        "https://lumenor.ai/cdn-cgi/imagedelivery/F5KOmplEz0rStV2qDKhYag/d60dd0e1-25cf-4a86-572e-931fa0d98900/source",
    },
    phone: {
      type: String,
      default: "0000000000",
    },
    address: {
      type: String,
      default: "No address provided",
    },
    birthday: {
      type: String,
      default: "01/01/2000",
    },
    role: {
      type: String,
      enum: ["admin", "superadmin", "employee", "client"],
      default: "admin",
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    authProvider: {
      type: String,
      enum: ["local", "google", "facebook"],
      default: "local",
    },
    verifiedDevices: [{ type: String }],
  },
  { timestamps: true }
);
// Index email for faster lookups
userSchema.index({ email: 1 });

// Export model
module.exports = mongoose.model("User", userSchema);
