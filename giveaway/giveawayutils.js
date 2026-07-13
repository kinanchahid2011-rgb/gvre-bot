const fs = require("node:fs");
const path = require("node:path");

const activeFile = path.join(__dirname, "../data/giveaways.json");
const endedFile = path.join(__dirname, "../data/endedGiveaways.json");

/* ----------------------------- Duration Parser ----------------------------- */

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

/* ----------------------------- File Helpers ----------------------------- */

function ensureFile(file) {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify([]));
  }
}

function loadActiveGiveaways() {
  ensureFile(activeFile);
  return JSON.parse(fs.readFileSync(activeFile, "utf8"));
}

function saveActiveGiveaways(data) {
  fs.writeFileSync(activeFile, JSON.stringify(data, null, 2));
}

function loadEndedGiveaways() {
  ensureFile(endedFile);
  return JSON.parse(fs.readFileSync(endedFile, "utf8"));
}

function saveEndedGiveaways(data) {
  fs.writeFileSync(endedFile, JSON.stringify(data, null, 2));
}

function saveGiveaway(giveaway) {
  const active = loadActiveGiveaways();
  active.push(giveaway);
  saveActiveGiveaways(active);
}

function moveToEnded(messageId) {
  const active = loadActiveGiveaways();
  const ended = loadEndedGiveaways();

  const index = active.findIndex((g) => g.messageId === messageId);
  if (index === -1) return;

  const [g] = active.splice(index, 1);
  ended.push(g);

  saveActiveGiveaways(active);
  saveEndedGiveaways(ended);
}

module.exports = {
  parseDuration,
  loadActiveGiveaways,
  saveActiveGiveaways,
  loadEndedGiveaways,
  saveEndedGiveaways,
  saveGiveaway,
  moveToEnded,
};
