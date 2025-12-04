const { PrismaClient } = require("@prisma/client");
const { DATABASE_URL } = require("../config/env");

// Ensure Prisma uses the same DATABASE_URL as our config
process.env.DATABASE_URL = DATABASE_URL;

let prisma;

if (!global.__prisma) {
  global.__prisma = new PrismaClient();
}

prisma = global.__prisma;

module.exports = prisma;


