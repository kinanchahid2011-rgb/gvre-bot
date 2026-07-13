const fs = require("node:fs");
const path = require("node:path");

// File locations
const econFile = path.join(__dirname, "../data/economy.json");
const roleIncomeFile = path.join(__dirname, "../data/roleIncome.json");

// Ensures a file exists, creates it if missing
function ensureFile(file, defaultData) {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify(defaultData, null, 2));
  }
}

// Load economy.json
function loadEconomy() {
  ensureFile(econFile, []);
  return JSON.parse(fs.readFileSync(econFile, "utf8"));
}

// Save economy.json
function saveEconomy(data) {
  fs.writeFileSync(econFile, JSON.stringify(data, null, 2));
}

// Load roleIncome.json
function loadRoleIncome() {
  ensureFile(roleIncomeFile, {});
  return JSON.parse(fs.readFileSync(roleIncomeFile, "utf8"));
}

// Get or create a user record
function getUserRecord(userId) {
  const econ = loadEconomy();
  let user = econ.find(u => u.userId === userId);

  if (!user) {
    user = { userId, cash: 0, lastCollect: 0 };
    econ.push(user);
    saveEconomy(econ);
  }

  return user;
}

// Update a user record
function updateUserRecord(user) {
  const econ = loadEconomy();
  const index = econ.findIndex(u => u.userId === user.userId);

  if (index === -1) {
    econ.push(user);
  } else {
    econ[index] = user;
  }

  saveEconomy(econ);
}

module.exports = {
  loadEconomy,
  saveEconomy,
  loadRoleIncome,
  getUserRecord,
  updateUserRecord,
};
