// index.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const path = require("path");
const pool = require("./db");

const app = express();

// ================================
// Middleware
// ================================
app.use(cors());
app.use(bodyParser.json());

// ✅ Serve all static files (CSS, JS, images)
app.use(express.static(path.join(__dirname, "public")));

// ================================
// ✅ API ROUTES
// ================================
const authRoutes = require("./routes/auth");
const authMiddleware = require("./middleware/authMiddleware");
const accountsRoutes = require("./routes/accounts");
const customersRoutes = require("./routes/customers");
const statsRoutes = require("./routes/stats");
const reportsRoutes = require("./routes/reports");

app.use("/auth", authRoutes);
app.use("/accounts", accountsRoutes);
app.use("/customers", customersRoutes);
app.use("/stats", statsRoutes);
app.use("/reports", reportsRoutes);

// ================================
// ✅ Test database connection
// ================================
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

// ================================
// ✅ FRONTEND ROUTES
// ================================
const viewPath = path.join(__dirname, "public", "views");

// Serve specific pages
app.get("/", (req, res) => res.sendFile(path.join(viewPath, "login.html")));
app.get("/login", (req, res) => res.sendFile(path.join(viewPath, "login.html")));
app.get("/index", (req, res) => res.sendFile(path.join(viewPath, "index.html")));
app.get("/history", (req, res) => res.sendFile(path.join(viewPath, "history.html")));
app.get("/payments", (req, res) => res.sendFile(path.join(viewPath, "payments.html")));
app.get("/helper", (req, res) => res.sendFile(path.join(viewPath, "helper.html")));

// ✅ Fallback route (Express 5+ compatible)
app.get("/*", (req, res) => {
  res.sendFile(path.join(viewPath, "login.html"));
});

// ================================
// ✅ Start Server
// ================================
const PORT = process.env.PORT || 10000; // Render expects port 10000
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
