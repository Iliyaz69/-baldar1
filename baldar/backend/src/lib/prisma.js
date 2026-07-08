const { PrismaClient } = require("@prisma/client");

// Единый экземпляр Prisma Client на всё приложение (рекомендация Prisma для Node.js/Express)
const prisma = global.__prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.__prisma = prisma;
}

module.exports = prisma;
