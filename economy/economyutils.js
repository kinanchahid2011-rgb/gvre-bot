const axios = require("axios");

// JSONBin setup
const BIN_ID = process.env.JSONBIN_BIN_ID;
const API_KEY = process.env.JSONBIN_API_KEY;
const BASE_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

// Load economy data from JSONBin
async function loadEconomy() {
  try {
    const res = await axios.get(BASE_URL, {
      headers: { "X-Master-Key": API_KEY },
    });
    return res.data.record.economy || [];
  } catch (err) {
    console.error("Error loading economy:", err);
    return [];
  }
}

// Save economy data to JSONBin
async function saveEconomy(data) {
  try {
    await axios.put(
      BASE_URL,
      { economy: data },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Master-Key": API_KEY,
        },
      },
    );
  } catch (err) {
    console.error("Error saving economy:", err);
  }
}

// Load role income (optional)
async function loadRoleIncome() {
  try {
    const res = await axios.get(BASE_URL, {
      headers: { "X-Master-Key": API_KEY },
    });
    return res.data.record.roleIncome || {};
  } catch (err) {
    console.error("Error loading role income:", err);
    return {};
  }
}

// Get or create a user record
async function getUserRecord(userId) {
  const econ = await loadEconomy();
  let user = econ.find((u) => u.userId === userId);

  if (!user) {
    user = { userId, cash: 0, lastCollect: 0 };
    econ.push(user);
    await saveEconomy(econ);
  }

  return user;
}

// Update a user record
async function updateUserRecord(user) {
  const econ = await loadEconomy();
  const index = econ.findIndex((u) => u.userId === user.userId);

  if (index === -1) econ.push(user);
  else econ[index] = user;

  await saveEconomy(econ);
}

module.exports = {
  loadEconomy,
  saveEconomy,
  loadRoleIncome,
  getUserRecord,
  updateUserRecord,
};
