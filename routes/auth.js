const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const { addToBlacklist } = require("../middleware/tokenBlacklist");

// Helper: generate tokens
function generateTokens(user) {
  const accessToken = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "60m" }
  );

  const refreshToken = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
}

// REGISTER (returns tokens now)
router.post("/register", async (req, res) => {
  const { username, password, full_name, role } = req.body;

  try {
    // 1. Check if username already exists
    const existing = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // 2. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Insert into DB
    const result = await pool.query(
      "INSERT INTO users (username, password_hash, full_name, role) VALUES ($1, $2, $3, $4) RETURNING id, username, full_name, role",
      [username, hashedPassword, full_name || username, role || "staff"]
    );

    const user = result.rows[0];

    // 4. Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // 5. Save refresh token
    await pool.query("INSERT INTO refresh_tokens (user_id, token) VALUES ($1, $2)", [
      user.id,
      refreshToken,
    ]);

    // 6. Return tokens + user
    res.status(201).json({
      message: "User registered successfully",
      user,
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    if (result.rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    await pool.query("INSERT INTO refresh_tokens (user_id, token) VALUES ($1, $2)", [
      user.id,
      refreshToken,
    ]);

    res.json({ accessToken, refreshToken });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// REFRESH
router.post("/refresh", async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(401).json({ message: "No refresh token provided" });

  try {
    const dbToken = await pool.query("SELECT * FROM refresh_tokens WHERE token = $1", [token]);
    if (dbToken.rows.length === 0) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const user = jwt.verify(token, process.env.REFRESH_SECRET);
    const { accessToken, refreshToken } = generateTokens(user);

    await pool.query("DELETE FROM refresh_tokens WHERE token = $1", [token]);
    await pool.query("INSERT INTO refresh_tokens (user_id, token) VALUES ($1, $2)", [
      user.id,
      refreshToken,
    ]);

    res.json({ accessToken, refreshToken });
  } catch (err) {
    console.error(err.message);
    res.status(403).json({ message: "Invalid or expired refresh token" });
  }
});

// LOGOUT
router.post("/logout", async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(400).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    await pool.query("DELETE FROM refresh_tokens WHERE user_id = $1", [decoded.id]);

    addToBlacklist(token);
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    res.status(403).json({ message: "Invalid or expired token" });
  }
});

module.exports = router;
