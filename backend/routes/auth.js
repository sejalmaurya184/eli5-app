const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");           // ✅ added
const nodemailer = require("nodemailer");   // ✅ added
const auth = require("../middleware/auth");

const router = express.Router();
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const BACKEND_URL = process.env.BACKEND_URL;
const MIN_PASSWORD_LENGTH = 8;

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !password || password.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({
        message: `Email and password (min ${MIN_PASSWORD_LENGTH} chars) are required`
      });
    }

    // check if user exists
    let user = await User.findOne({ email: normalizedEmail });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // generate verification token
    const token = crypto.randomBytes(32).toString("hex");

    // create user
    user = new User({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      verificationToken: token,   // ✅ added
      isVerified: false           // ✅ added
    });

    await user.save();

    const requestBaseUrl = `${req.protocol}://${req.get("host")}`;
    const backendBaseUrl = BACKEND_URL || requestBaseUrl;
    const verifyURL = `${backendBaseUrl.replace(/\/+$/, "")}/api/auth/verify/${token}`;
    await transporter.sendMail({
      to: normalizedEmail,
      subject: "Verify your email",
      html: `
        <h3>Welcome ${name || "User"}</h3>
        <p>Click below to verify your email:</p>
        <a href="${verifyURL}">Verify Email</a>
      `
    });

    res.json({
      message: "User registered. Check your email to verify."
    });

  } catch (err) {
    console.log(err);
    res.status(500).send("Server error");
  }
});

// VERIFY EMAIL
router.get("/verify/:token", async (req, res) => {
  try {
    const user = await User.findOne({
      verificationToken: req.params.token
    });

    if (!user) {
      return res.send("Invalid or expired token");
    }

    user.isVerified = true;
    user.verificationToken = undefined;

    await user.save();

    res.send("Email verified successfully! You can now login.");
  } catch (err) {
    res.status(500).send("Server error");
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // check user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 🚨 BLOCK LOGIN IF NOT VERIFIED
    if (!user.isVerified) {
      return res.status(400).json({
        message: "Please verify your email first"
      });
    }

    // compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // create token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, message: "Login successful" });

  } catch (err) {
    console.log(err);
    res.status(500).send("Server error");
  }
});
// FORGOT PASSWORD
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.json({
        message: "If an account with that email exists, a reset link has been sent."
      });
    }

    const token = crypto.randomBytes(32).toString("hex");

    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 15 * 60 * 1000;

    await user.save();

    const resetURL = `${FRONTEND_URL}/reset-password/${token}`;
    await transporter.sendMail({
      to: normalizedEmail,
      subject: "Reset your password",
      html: `<a href="${resetURL}">Reset Password</a>`
    });

    res.json({
      message: "If an account with that email exists, a reset link has been sent."
    });

  } catch (err) {
    console.log(err);
    res.status(500).send("Server error");
  }
});


// RESET PASSWORD
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({
        message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`
      });
    }

    const user = await User.findOne({
      resetToken: req.params.token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.password = await bcrypt.hash(password, 10);

    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save();

    res.json({ message: "Password reset successful" });

  } catch (err) {
    res.status(500).send("Server error");
  }
});

// CHANGE PASSWORD (LOGGED-IN USER)
router.post("/change-password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required"
      });
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({
        message: `New password must be at least ${MIN_PASSWORD_LENGTH} characters`
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        message: "New password must be different from current password"
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).send("Server error");
  }
});

module.exports = router;