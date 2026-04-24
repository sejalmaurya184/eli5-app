const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  resetToken: String,
  resetTokenExpiry: Date,
  history: [
    {
      input: String,
      output: String,
      level: String,
      createdAt: { type: Date, default: Date.now }
    }
  ]
});

module.exports = mongoose.model("User", userSchema);