const fs = require("fs");
const path = require("path");
const { ROOT_DIR } = require("../config/env");

const DATA_FILE = path.join(ROOT_DIR, "data.json");

const EMPTY_STATE = {
  users: [],
  categories: [],
  subcategories: [],
  transactions: [],
  assets: [],
  liabilities: [],
};

let state = loadState();
let idCounters = initCounters(state);

function loadState() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return { ...EMPTY_STATE };
    }
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return {
      ...EMPTY_STATE,
      ...(parsed || {}),
    };
  } catch (err) {
    console.error("Failed to load data store, starting fresh:", err);
    return { ...EMPTY_STATE };
  }
}

function saveState() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), "utf8");
}

function initCounters(s) {
  const counters = {};
  for (const key of Object.keys(EMPTY_STATE)) {
    const arr = s[key] || [];
    const maxId = arr.reduce(
      (max, item) => (typeof item.id === "number" && item.id > max ? item.id : max),
      0
    );
    counters[key] = maxId;
  }
  return counters;
}

function nextId(collection) {
  if (!idCounters[collection]) {
    idCounters[collection] = 0;
  }
  idCounters[collection] += 1;
  return idCounters[collection];
}

function getState() {
  return state;
}

function commit(mutator) {
  mutator(state);
  saveState();
}

module.exports = {
  getState,
  commit,
  nextId,
};


