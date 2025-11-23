const express = require("express");
const router = express.Router();
const pool = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

// Create new account for a customer
router.post("/", authMiddleware, async (req, res) => {
  const { customer_id, account_type, initial_balance } = req.body;

  try {
    // Generate a random account number
    const accountNumber = "ACC" + Math.floor(100000 + Math.random() * 900000);

    const result = await pool.query(
      "INSERT INTO accounts (customer_id, account_number, account_type, balance) VALUES ($1, $2, $3, $4) RETURNING *",
      [customer_id, accountNumber, account_type, initial_balance || 0]
    );

    res.status(201).json({ message: "Account created", account: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Get all accounts for a customer
router.get("/:customer_id", authMiddleware, async (req, res) => {
    try {
      const customerId = req.params.customer_id;
  
      // TODO: run SQL query to select all accounts for this customer
      const result = await pool.query("SELECT * FROM accounts WHERE customer_id = $1", [ customerId]);
  
      // TODO: return the result as JSON
      res.json(result.rows);
  
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
});

// Deposit money into an account
router.post("/:account_id/deposit", authMiddleware, async (req, res) => {
    const { amount } = req.body;
    const accountId = req.params.account_id;
  
    try {
      if (amount <= 0) {
        return res.status(400).json({ message: "Deposit amount must be positive" });
      }
  
      // 1. Update account balance
      const updateBalance = await pool.query(
        "UPDATE accounts SET balance = balance + $1 WHERE id = $2 RETURNING *",
        [amount, accountId]
      );
  
      if (updateBalance.rows.length === 0) {
        return res.status(404).json({ message: "Account not found" });
      }
  
      // 2. Record transaction
      await pool.query(
        "INSERT INTO transactions (account_id, type, amount, description) VALUES ($1, $2, $3, $4)",
        [accountId, "deposit", amount, "Deposit made"]
      );
  
      res.json({ message: "Deposit successful", account: updateBalance.rows[0] });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
});
  
//Withdrawal money from an account
router.post("/:account_id/withdraw", authMiddleware, async (req, res) =>{
    const { amount } = req.body;
    const accountId = req.params.account_id;
    
    //check withdraw ammount if it is not more than account balance
    try {
        if (amount <= 0) {
            return res.status(404).json({message: "Withdrawal amount must be positive"});
        }

        //check balance first
        const accountBalance = await pool.query(
            "SELECT balance FROM accounts WHERE id = $1",
            [accountId]
        );

        if (accountBalance.rows.length === 0) {
            return res.status(404).json({ message: "Account not found" });
        }

        const currentBalance = parseFloat(accountBalance.rows[0].balance);

        if (amount > currentBalance) {
            return res.status(400).json({ message: "Insufficient balance" });
        }

        // 2. Deduct amount
        const updateBalance = await pool.query(
            "UPDATE accounts SET balance = balance - $1 WHERE id = $2 RETURNING *",
            [amount, accountId]
        );

        // 3. Record transaction
        await pool.query(
            "INSERT INTO transactions (account_id, type, amount, description) VALUES ($1, $2, $3, $4)",
            [accountId, "withdraw", amount, "Withdrawal made"]
        );

        res.json({ message: "Withdrawal successful", account: updateBalance.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

// Transfer money between two accounts
router.post("/:from_account_id/transfer/:to_account_id", authMiddleware, async (req, res) => {
    const { amount } = req.body;
    const fromAccountId = req.params.from_account_id;
    const toAccountId = req.params.to_account_id;
  
    try {
      if (amount <= 0) {
        return res.status(400).json({ message: "Transfer amount must be positive" });
      }
  
      // Start transaction
      await pool.query("BEGIN");
  
      // 1. Check sender balance
      const senderBalance = await pool.query(
        "SELECT balance FROM accounts WHERE id = $1",
        [fromAccountId]
      );
  
      if (senderBalance.rows.length === 0) {
        await pool.query("ROLLBACK");
        return res.status(404).json({ message: "Sender account not found" });
      }
  
      const currentBalance = parseFloat(senderBalance.rows[0].balance);
      if (amount > currentBalance) {
        await pool.query("ROLLBACK");
        return res.status(400).json({ message: "Insufficient funds in sender account" });
      }
  
      // 2. Deduct from sender
      const updatedSender = await pool.query(
        "UPDATE accounts SET balance = balance - $1 WHERE id = $2 RETURNING *",
        [amount, fromAccountId]
      );
  
      // 3. Add to receiver
      const updatedReceiver = await pool.query(
        "UPDATE accounts SET balance = balance + $1 WHERE id = $2 RETURNING *",
        [amount, toAccountId]
      );
  
      if (updatedReceiver.rows.length === 0) {
        await pool.query("ROLLBACK");
        return res.status(404).json({ message: "Receiver account not found" });
      }
  
      // 4. Record transactions
      await pool.query(
        "INSERT INTO transactions (account_id, type, amount, description) VALUES ($1, $2, $3, $4)",
        [fromAccountId, "transfer_out", amount, `Transfer to account ${toAccountId}`]
      );
  
      await pool.query(
        "INSERT INTO transactions (account_id, type, amount, description) VALUES ($1, $2, $3, $4)",
        [toAccountId, "transfer_in", amount, `Transfer from account ${fromAccountId}`]
      );
  
      // Commit transaction
      await pool.query("COMMIT");
  
      res.json({
        message: "Transfer successful",
        from_account: updatedSender.rows[0],
        to_account: updatedReceiver.rows[0]
      });
  
    } catch (err) {
      await pool.query("ROLLBACK"); // rollback if any error
      console.error(err.message);
      res.status(500).send("Server error");
    }
});
  
// Get all transactions for an account
router.get("/:account_id/transactions", authMiddleware, async (req, res) => {
  const accountId = req.params.account_id;

  try {
    const result = await pool.query(
      "SELECT * FROM transactions WHERE account_id = $1 ORDER BY created_at DESC",
      [accountId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Get recent transactions (last 10 for dashboard)
router.get("/recent/all", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        t.id, 
        t.type, 
        t.amount::float AS amount,  --  cast to float
        t.created_at,
        a.account_number,
        c.first_name, 
        c.last_name
      FROM transactions t
      JOIN accounts a ON t.account_id = a.id
      JOIN customers c ON a.customer_id = c.id
      ORDER BY t.created_at DESC
      LIMIT 10
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});



module.exports = router;
