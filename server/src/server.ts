import { app } from './app.js';
import { ENV } from './config/env.js';
import { logger } from './config/logger.js';
import { connectDatabase, disconnectDatabase } from './database/prismaClient.js';
import { complianceScheduler } from './services/complianceScheduler.js';

async function bootstrap() {
  try {
    // 1. Connect to Database
    await connectDatabase();

    // 2. Start Scheduler
    complianceScheduler.startScheduler();

    // 3. Start HTTP Listener
    const server = app.listen(ENV.PORT, () => {
      logger.info(`🚀 TransitOps Production API Server active on http://localhost:${ENV.PORT}`);
      logger.info(`📡 Health check accessible at http://localhost:${ENV.PORT}/health`);
      logger.info(`🔐 CORS allowlist enabled for: ${ENV.CORS_ORIGIN}`);
    });

    // Graceful Shutdown
    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Gracefully shutting down TransitOps server...`);
      server.close(async () => {
        await disconnectDatabase();
        logger.info('Server closed. Exiting process.');
        process.exit(0);
      });

      // Force close after 10s if stuck
      setTimeout(() => {
        logger.error('Forced shutdown after timeout.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    logger.error('Critical failure during server bootstrap:', err);
    process.exit(1);
  }
}

bootstrap();
