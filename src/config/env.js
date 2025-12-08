// config/env.js
const path = require("path");
require("dotenv").config();

// Absolute root directory of the project
const ROOT_DIR = path.resolve(__dirname, "..", "..");

// Use Railway's dynamic port if available, fallback to 3000 locally
const PORT = process.env.PORT || 3000;

// Use MySQL database URL from environment, no fallback to SQLite
const DATABASE_URL = process.env.DATABASE_URL;

module.exports = {
  PORT,
  NODE_ENV: process.env.NODE_ENV || "development",
  JWT_SECRET: process.env.JWT_SECRET || "super-secret-jwt-key-change-me",
  DATABASE_URL,
  ROOT_DIR,
};


