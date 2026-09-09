import { prisma } from '../database/prismaClient.js';

export const driverService = {
  async getDrivers() {
    const list = await prisma.driver.findMany({
      orderBy: { name: 'asc' },
    });

    const now = new Date();
    return list.map(d => {
      const expiry = new Date(d.licenseExpiryDate);
      const diffTime = expiry.getTime() - now.getTime();
      const daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const isLicenseValid = daysUntilExpiry > 0;
      const isExpiringSoon = daysUntilExpiry > 0 && daysUntilExpiry <= 30;

      return {
        ...d,
        daysUntilExpiry,
        isLicenseValid,
        isExpiringSoon,
      };
    });
  },

  async getDriverById(id: string) {
    const driver = await prisma.driver.findUnique({
      where: { id },
    });

    if (!driver) {
      const err = new Error(`Driver with ID ${id} not found.`);
      (err as any).status = 404;
      throw err;
    }

    const expiry = new Date(driver.licenseExpiryDate);
    const diffTime = expiry.getTime() - new Date().getTime();
    const daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      ...driver,
      daysUntilExpiry,
      isLicenseValid: daysUntilExpiry > 0,
      isExpiringSoon: daysUntilExpiry > 0 && daysUntilExpiry <= 30,
    };
  },

  async createDriver(data: any) {
    const existing = await prisma.driver.findUnique({
      where: { licenseNumber: data.licenseNumber },
    });

    if (existing) {
      const err = new Error(`Driver with license number ${data.licenseNumber} already exists.`);
      (err as any).status = 409;
      (err as any).code = 'DUPLICATE_LICENSE';
      throw err;
    }

    return prisma.driver.create({
      data: {
        name: data.name,
        licenseNumber: data.licenseNumber,
        licenseCategory: data.licenseCategory,
        licenseExpiryDate: data.licenseExpiryDate,
        contactNumber: data.contactNumber,
        email: data.email,
        status: 'Available',
        safetyScore: 95,
        tripsCompleted: 0,
        violationCount: 0,
        performanceScore: 95,
        joinedDate: data.joinedDate || new Date().toISOString().split('T')[0],
      },
    });
  },

  async suspendDriver(id: string, reason: string) {
    await this.getDriverById(id);

    // Create an audit alert for driver suspension
    const updated = await prisma.driver.update({
      where: { id },
      data: {
        status: 'Suspended',
        suspendedReason: reason,
      },
    });

    await prisma.alert.create({
      data: {
        type: 'suspended_driver_attempt',
        severity: 'warning',
        title: `Driver Suspended: ${updated.name}`,
        description: `Safety Officer disciplinary hold: ${reason}`,
        relatedEntityType: 'driver',
        relatedEntityId: updated.id,
        actionUrl: '/drivers',
        actionLabel: 'Review Compliance',
      },
    });

    return updated;
  },

  async reinstateDriver(id: string) {
    await this.getDriverById(id);

    return prisma.driver.update({
      where: { id },
      data: {
        status: 'Available',
        suspendedReason: null,
      },
    });
  },
};
