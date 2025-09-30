// middleware/tokenBlacklist.js

// In-memory blacklist (resets if server restarts)
let tokenBlacklist = [];

function addToBlacklist(token) {
  tokenBlacklist.push(token);
}

function isBlacklisted(token) {
  return tokenBlacklist.includes(token);
}

module.exports = { addToBlacklist, isBlacklisted };
