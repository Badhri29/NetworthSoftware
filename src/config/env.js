// config/env.js
const path = require("path");
require("dotenv").config();

// Validate critical environment variables
if (!process.env.DATABASE_URL) {
  console.error("ERROR: DATABASE_URL environment variable is not set!");
  console.error("Please set DATABASE_URL in your .env file or environment variables.");
  process.exit(1);
}

// Absolute root directory of the project
const ROOT_DIR = path.resolve(__dirname, "..", "..");

// Use cloud provider's dynamic port if available, fallback to 8080 locally
const PORT = process.env.PORT || 8080;

// Use MySQL database URL from environment
const DATABASE_URL = process.env.DATABASE_URL;

// Log connection status (without password)
const dbUrlObj = new URL(DATABASE_URL);
const dbHost = dbUrlObj.hostname;
const dbName = dbUrlObj.pathname.replace('/', '');
console.log(`✓ Database configured: ${dbHost}/${dbName}`);

module.exports = {
  PORT,
  NODE_ENV: process.env.NODE_ENV || "development",
  JWT_SECRET: process.env.JWT_SECRET || "super-secret-jwt-key-change-me",
  DATABASE_URL,
  ROOT_DIR,
};


