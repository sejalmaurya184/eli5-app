require("dotenv").config();
const axios = require("axios");

async function checkAccount() {
  try {
    const response = await axios.get(
      "https://openrouter.ai/api/v1/auth/key",
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`
        }
      }
    );
    console.log("✅ Key is valid:", response.data);
  } catch (err) {
    console.log("❌ Key error:", err.response?.data || err.message);
  }
}

checkAccount();