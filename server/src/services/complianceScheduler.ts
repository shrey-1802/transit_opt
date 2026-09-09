import { prisma } from '../database/prismaClient.js';
import { logger } from '../config/logger.js';

export const complianceScheduler = {
  async runDailyComplianceCheck() {
    try {
      logger.info('Running automated daily driver license compliance check...');
      const drivers = await prisma.driver.findMany();
      const now = new Date();

      for (const driver of drivers) {
        const expiry = new Date(driver.licenseExpiryDate);
        const days = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (days <= 30) {
          // Check if an unread alert already exists for this driver in the last 24h
          const existingAlert = await prisma.alert.findFirst({
            where: {
              type: 'license_expiry',
              relatedEntityType: 'driver',
              relatedEntityId: driver.id,
              isRead: false,
            },
          });

          if (!existingAlert) {
            await prisma.alert.create({
              data: {
                type: 'license_expiry',
                severity: days <= 0 ? 'critical' : 'warning',
                title: days <= 0 ? `License EXPIRED: ${driver.name}` : `License Expiry Approaching: ${driver.name}`,
                description: days <= 0
                  ? `Commercial license (${driver.licenseNumber}) expired ${Math.abs(days)} days ago. Dispatch prohibited.`
                  : `Commercial license (${driver.licenseNumber}) expires in ${days} days on ${driver.licenseExpiryDate}. Renewal required.`,
                relatedEntityType: 'driver',
                relatedEntityId: driver.id,
                actionUrl: '/drivers',
                actionLabel: 'Audit Driver License',
              },
            });
            logger.info(`Generated license expiry alert for driver ${driver.name} (${days} days remaining).`);
          }
        }
      }
    } catch (err) {
      logger.error('Error during compliance scheduler check:', err);
    }
  },

  startScheduler(intervalMs = 24 * 60 * 60 * 1000) {
    // Run once on startup
    this.runDailyComplianceCheck();
    // Schedule recurring
    const timer = setInterval(() => {
      this.runDailyComplianceCheck();
    }, intervalMs);

    return () => clearInterval(timer);
  },
};
