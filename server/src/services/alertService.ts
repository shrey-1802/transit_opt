import { prisma } from '../database/prismaClient.js';

export const alertService = {
  async getAlerts() {
    return prisma.alert.findMany({
      orderBy: { timestamp: 'desc' },
    });
  },

  async markAsRead(id: string) {
    return prisma.alert.update({
      where: { id },
      data: { isRead: true },
    });
  },

  async createAlert(data: {
    type: string;
    severity: string;
    title: string;
    description: string;
    relatedEntityType?: string;
    relatedEntityId?: string;
    actionUrl?: string;
    actionLabel?: string;
  }) {
    return prisma.alert.create({
      data,
    });
  },
};
