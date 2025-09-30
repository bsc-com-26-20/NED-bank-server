const express = require("express");
const router = express.Router();
const pool = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

// Create a new customer
router.post("/", authMiddleware, async (req, res) => {
  const { first_name, last_name, national_id, phone, email, address, date_of_birth, kyc_verified } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO customers 
      (first_name, last_name, national_id, phone, email, address, date_of_birth, kyc_verified) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [first_name, last_name, national_id, phone, email, address, date_of_birth, kyc_verified || false]
    );

    res.status(201).json({ message: "Customer created", customer: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Get all customers
router.get("/", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM customers");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Get one customer with their accounts
router.get("/:id/accounts", authMiddleware, async (req, res) => {
    const customerId = req.params.id;
  
    try {
      // 1. Get customer
      const customerResult = await pool.query(
        "SELECT * FROM customers WHERE id = $1",
        [customerId]
      );
  
      if (customerResult.rows.length === 0) {
        return res.status(404).json({ message: "Customer not found" });
      }
  
      const customer = customerResult.rows[0];
  
      // 2. Get accounts for that customer
      const accountsResult = await pool.query(
        "SELECT * FROM accounts WHERE customer_id = $1",
        [customerId]
      );
  
      // 3. Combine and send back
      res.json({
        ...customer,
        accounts: accountsResult.rows
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  });
  

module.exports = router;
