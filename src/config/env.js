const path = require("path");
require("dotenv").config();

const ROOT_DIR = path.resolve(__dirname, "..", "..");

module.exports = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || "development",
  JWT_SECRET: process.env.JWT_SECRET || "super-secret-jwt-key-change-me",
  DATABASE_URL:
    process.env.DATABASE_URL ||
    `file:${path.join(ROOT_DIR, "dev.db").replace(/\\/g, "/")}`,
  ROOT_DIR,
};


