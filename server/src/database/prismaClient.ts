import { PrismaClient } from '@prisma/client';
import { logger } from '../config/logger.js';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

export async function connectDatabase() {
  try {
    await prisma.$connect();
    logger.info('Connected successfully to database via Prisma ORM.');
  } catch (err) {
    logger.error('Database connection failed:', err);
    throw err;
  }
}

export async function disconnectDatabase() {
  await prisma.$disconnect();
  logger.info('Database disconnected cleanly.');
}
