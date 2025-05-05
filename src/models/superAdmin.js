const mongoose = require("mongoose");
const { Schema } = mongoose;
const SuperAdminSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"], // Email regex validation
    },
    password: {
      type: String,
      required: true,
      minlength: 6, // Ensures a minimum password length
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
  { timestamps: true } // Adds `createdAt` & `updatedAt` automatically
);
// Index email for faster lookups
SuperAdminSchema.index({ email: 1 });
// Export model
module.exports = mongoose.model("SuperAdmin", SuperAdminSchema);
