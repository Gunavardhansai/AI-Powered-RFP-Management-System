// backend/src/lib/prismaClient.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Allow BOTH import styles:
// 1) const prisma = require('../lib/prismaClient');
// 2) const { prisma } = require('../lib/prismaClient');
module.exports = prisma;
module.exports.prisma = prisma;
