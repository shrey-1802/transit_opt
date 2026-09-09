import { prisma } from '../database/prismaClient.js';

export const maintenanceService = {
  async getRecords() {
    return prisma.maintenanceLog.findMany({
      orderBy: { startDate: 'desc' },
      include: { vehicle: true },
    });
  },

  async createMaintenance(data: {
    vehicleId: string;
    type: string;
    priority?: string;
    description?: string;
    cost?: number;
    technicianOrShop?: string;
  }) {
    const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
    if (!vehicle) {
      const err = new Error(`Vehicle ${data.vehicleId} not found.`);
      (err as any).status = 404;
      throw err;
    }

    return prisma.$transaction(async (tx) => {
      // 1. Create Maintenance Log
      const log = await tx.maintenanceLog.create({
        data: {
          vehicleId: vehicle.id,
          vehicleReg: vehicle.registrationNumber,
          type: data.type,
          priority: data.priority || 'Routine',
          description: data.description,
          cost: data.cost || 0,
          odometerAtService: vehicle.odometer,
          technicianOrShop: data.technicianOrShop || 'Central Maintenance Bay',
          status: 'In Progress',
          startDate: new Date(),
        },
      });

      // 2. Set vehicle status = In Shop (locked out of dispatch pool)
      await tx.vehicle.update({
        where: { id: vehicle.id },
        data: {
          status: 'In Shop',
          lifecycleState: 'Maintenance',
        },
      });

      // 3. Create Alert
      await tx.alert.create({
        data: {
          type: 'vehicle_service_due',
          severity: 'warning',
          title: `Vehicle In Shop: ${vehicle.registrationNumber}`,
          description: `Work order opened: ${data.type} ($${(data.cost || 0).toLocaleString()}). Asset locked in workshop.`,
          relatedEntityType: 'vehicle',
          relatedEntityId: vehicle.id,
          actionUrl: '/maintenance',
          actionLabel: 'Inspect Work Order',
        },
      });

      return log;
    });
  },

  async closeMaintenance(recordId: string) {
    const record = await prisma.maintenanceLog.findUnique({ where: { id: recordId } });
    if (!record) {
      const err = new Error(`Maintenance record ${recordId} not found.`);
      (err as any).status = 404;
      throw err;
    }

    return prisma.$transaction(async (tx) => {
      const updatedRecord = await tx.maintenanceLog.update({
        where: { id: recordId },
        data: {
          status: 'Completed',
          completionDate: new Date(),
        },
      });

      const vehicle = await tx.vehicle.findUnique({ where: { id: record.vehicleId } });
      if (vehicle && vehicle.status !== 'Retired') {
        await tx.vehicle.update({
          where: { id: record.vehicleId },
          data: {
            status: 'Available',
            lifecycleState: 'Available',
            lastServiceOdometer: vehicle.odometer,
          },
        });
      }

      return updatedRecord;
    });
  },
};
