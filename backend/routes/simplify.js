const express = require("express");
const auth = require("../middleware/auth");
const User = require("../models/User");
const axios = require("axios");

const router = express.Router();
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";

// 🔵 SIMPLIFY ROUTE
router.post("/", auth, async (req, res) => {
  try {
    const { text, level } = req.body;

    let simplified;
    const MODEL_SLUG = "openrouter/free";

    try {
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: MODEL_SLUG,
          messages: [
            {
              role: "user",
              content: `Explain this in very simple terms like I'm ${level} years old:\n${text}`
            }
          ]
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": BACKEND_URL
          }
        }
      );

      simplified = response.data.choices?.[0]?.message?.content;

    } catch (err) {
      console.log("OpenRouter failed:", err.response?.data || err.message);
      simplified = `(${level}) Simple version: ${text}`;
    }

    const user = await User.findById(req.user.id);

    const newEntry = {
      input: text,
      output: simplified,
      level
    };

    user.history.unshift(newEntry);

    if (user.history.length > 10) {
      user.history.pop();
    }

    await user.save();

    res.json({
      simplified,
      history: user.history
    });

  } catch (err) {
    console.log(err);
    res.status(500).send("Server error");
  }
});


// 🗑️ DELETE HISTORY ROUTE (OUTSIDE)
router.delete("/history", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    user.history = [];
    await user.save();

    res.json({ msg: "History cleared" });
  } catch (err) {
    console.log(err);
    res.status(500).send("Server error");
  }
});

module.exports = router;