const fs = require("node:fs");
const path = require("node:path");

const dataFile = path.join(__dirname, "../data/giveaways.json");

/* ----------------------------- Duration Parser ----------------------------- */
/*
Supports:
- s  (seconds)
- m  (minutes)
- h  (hours)
- d  (days)
- w  (weeks)
- mo (months)
- y  (years)
*/

function parseDuration(input) {
  input = input.toLowerCase().trim();

  const regex = /^(\d+)\s*(s|m|h|d|w|mo|y)$/;
  const match = input.match(regex);

  if (!match) return null;

  const value = parseInt(match[1]);
  const unit = match[2];

  const multipliers = {
    s: 1000,
    m: 1000 * 60,
    h: 1000 * 60 * 60,
    d: 1000 * 60 * 60 * 24,
    w: 1000 * 60 * 60 * 24 * 7,
    mo: 1000 * 60 * 60 * 24 * 30,
    y: 1000 * 60 * 60 * 24 * 365,
  };

  return value * multipliers[unit];
}

/* ----------------------------- File Handling ----------------------------- */

function loadGiveaways() {
  try {
    if (!fs.existsSync(dataFile)) {
      fs.writeFileSync(dataFile, JSON.stringify([]));
      return [];
    }

    const raw = fs.readFileSync(dataFile, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to load giveaways.json:", err);
    return [];
  }
}

function saveGiveaways(data) {
  try {
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Failed to save giveaways.json:", err);
  }
}

function saveGiveaway(giveaway) {
  const giveaways = loadGiveaways();
  giveaways.push(giveaway);
  saveGiveaways(giveaways);
}

function removeGiveaway(messageId) {
  const giveaways = loadGiveaways();
  const filtered = giveaways.filter(g => g.messageId !== messageId);
  saveGiveaways(filtered);
}

/* ----------------------------- Exports ----------------------------- */

module.exports = {
  parseDuration,
  loadGiveaways,
  saveGiveaways,
  saveGiveaway,
  removeGiveaway,
};
