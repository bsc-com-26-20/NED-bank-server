// index.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const path = require("path");
const pool = require("./db");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Serve static frontend files
app.use(express.static(path.join(__dirname, "public")));

// Import routes
const authRoutes = require("./routes/auth");
const authMiddleware = require("./middleware/authMiddleware");

// Use routes
app.use("/auth", authRoutes);

// Root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ✅ Database test route
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("✅ Database connection successful:", result.rows[0]);
    res.json({ success: true, time: result.rows[0].now });
  } catch (error) {
    console.error("❌ Database test failed:", error);
    res.status(500).json({ success: false, error: "Database connection failed" });
  }
});

// Protected Customers route
app.get("/customers", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM customers");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Other routes
const accountsRoutes = require("./routes/accounts");
app.use("/accounts", accountsRoutes);

const customersRoutes = require("./routes/customers");
app.use("/customers", customersRoutes);

const statsRoutes = require("./routes/stats");
app.use("/stats", statsRoutes);

const reportsRoutes = require("./routes/reports");
app.use("/reports", reportsRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
