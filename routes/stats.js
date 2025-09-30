const express = require("express");
const router = express.Router();
const pool = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

// Dashboard stats
router.get("/", authMiddleware, async (req, res) => {
  try {
    const totalCustomers = await pool.query("SELECT COUNT(*) FROM customers");
    const totalAccounts = await pool.query("SELECT COUNT(*) FROM accounts");
    const totalBalance = await pool.query(
      "SELECT COALESCE(SUM(balance)::float, 0) AS total_balance FROM accounts"
    );

    res.json({
      total_customers: parseInt(totalCustomers.rows[0].count, 10),
      total_accounts: parseInt(totalAccounts.rows[0].count, 10),
      total_balance: totalBalance.rows[0].total_balance,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
