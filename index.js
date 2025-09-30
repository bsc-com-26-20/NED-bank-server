const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const pool = require("./db");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Import routes
const authRoutes = require("./routes/auth");
const authMiddleware = require("./middleware/authMiddleware");

// Use routes
app.use("/auth", authRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("MiniBank API is running ✅");
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

//account route
const accountsRoutes = require("./routes/accounts");
app.use("/accounts", accountsRoutes);

//customer route
const customersRoutes = require("./routes/customers");
app.use("/customers", customersRoutes);

// stats route
const statsRoutes = require("./routes/stats");
app.use("/stats", statsRoutes);

// reports route
const reportsRoutes = require("./routes/reports");
app.use("/reports", reportsRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
