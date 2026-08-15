const mongoose = require("mongoose");

// Create User Schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create User Model
const User = mongoose.model("User", userSchema);

// Export the Model
module.exports = User;