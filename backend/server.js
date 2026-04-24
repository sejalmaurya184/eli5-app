require("dotenv").config();        // ✅ 1. Load env vars FIRST
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 5000;
const normalizeOrigin = (value) => (value || "").trim().replace(/\/+$/, "");
const allowedOrigins = [
  normalizeOrigin(process.env.FRONTEND_URL || "http://localhost:3000"),
  "http://localhost:3000"
];

app.set("trust proxy", 1);

// ✅ 2. Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser clients (e.g., server-to-server, curl, Postman)
    if (!origin) {
      return callback(null, true);
    }

    const normalizedOrigin = normalizeOrigin(origin);
    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  }
}));
app.use(express.json());

// ✅ 3. DB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// ✅ 4. Routes
const authRoutes = require("./routes/auth");
const simplifyRoutes = require("./routes/simplify");
const auth = require("./middleware/auth");

app.get("/", (req, res) => res.send("API is running"));
app.use("/api/auth", authRoutes);
app.use("/api/simplify", simplifyRoutes);
app.get("/api/protected", auth, (req, res) => {
  res.json({ message: "Protected route accessed", user: req.user });
});

// ✅ 5. Start server LAST
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});