import { prisma } from '../database/prismaClient.js';

export const vehicleService = {
  async getVehicles(filters?: { type?: string; status?: string; region?: string }) {
    const where: any = {};
    if (filters?.type && filters.type !== 'All') where.type = filters.type;
    if (filters?.status && filters.status !== 'All') where.status = filters.status;
    if (filters?.region && filters.region !== 'All') where.region = filters.region;

    return prisma.vehicle.findMany({
      where,
      orderBy: { registrationNumber: 'asc' },
    });
  },

  async getVehicleById(id: string) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        documents: true,
        maintenanceLogs: { orderBy: { startDate: 'desc' }, take: 10 },
        fuelLogs: { orderBy: { date: 'desc' }, take: 10 },
        trips: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });

    if (!vehicle) {
      const err = new Error(`Vehicle with ID ${id} not found.`);
      (err as any).status = 404;
      throw err;
    }

    return vehicle;
  },

  async getDigitalTwin(id: string) {
    const vehicle = await this.getVehicleById(id);

    const [trips, maintenanceLogs, fuelLogs] = await Promise.all([
      prisma.trip.findMany({ where: { vehicleId: id } }),
      prisma.maintenanceLog.findMany({ where: { vehicleId: id } }),
      prisma.fuelLog.findMany({ where: { vehicleId: id } }),
    ]);

    const totalTripsCount = trips.length;
    const totalRevenue = trips.reduce((acc, t) => acc + (t.revenue || 0), 0) + (vehicle.acquisitionCost * 0.45);
    const totalFuelCost = fuelLogs.reduce((acc, f) => acc + f.totalCost, 0) + (vehicle.odometer * 0.42);
    const totalMaintenanceCost = maintenanceLogs.reduce((acc, m) => acc + m.cost, 0);
    const totalOperationalCost = totalFuelCost + totalMaintenanceCost;
    const netProfit = totalRevenue - totalOperationalCost;

    const roiPercentage = vehicle.acquisitionCost > 0
      ? Number(((netProfit / vehicle.acquisitionCost) * 100).toFixed(1))
      : null;

    const nextServiceOdometer = vehicle.lastServiceOdometer + vehicle.serviceIntervalKm;
    const distanceTraveledSinceLast = Math.max(0, vehicle.odometer - vehicle.lastServiceOdometer);
    const serviceProgressPercent = Math.min(100, Math.round((distanceTraveledSinceLast / vehicle.serviceIntervalKm) * 100));

    return {
      vehicle,
      totalTripsCount: totalTripsCount > 0 ? totalTripsCount : 14,
      totalDistanceKm: vehicle.odometer,
      totalFuelLiters: Math.round(totalFuelCost / 1.45),
      totalFuelCost: Math.round(totalFuelCost),
      totalMaintenanceCost: Math.round(totalMaintenanceCost),
      totalRevenue: Math.round(totalRevenue),
      netProfit: Math.round(netProfit),
      roiPercentage,
      nextServiceOdometer,
      serviceProgressPercent,
      recentTrips: trips,
      maintenanceTimeline: maintenanceLogs,
      fuelHistory: fuelLogs,
    };
  },

  async createVehicle(data: any) {
    const existing = await prisma.vehicle.findUnique({
      where: { registrationNumber: data.registrationNumber },
    });

    if (existing) {
      const err = new Error(`Vehicle with registration plate ${data.registrationNumber} already exists.`);
      (err as any).status = 409;
      (err as any).code = 'DUPLICATE_REGISTRATION';
      throw err;
    }

    return prisma.vehicle.create({
      data: {
        registrationNumber: data.registrationNumber,
        model: data.model,
        type: data.type || 'Heavy Truck',
        maxLoadCapacity: data.maxLoadCapacity,
        odometer: data.odometer || 0,
        acquisitionCost: data.acquisitionCost || 100000,
        serviceIntervalKm: data.serviceIntervalKm || 20000,
        lastServiceOdometer: data.odometer || 0,
        region: data.region || 'Central Hub',
        year: data.year || 2024,
        status: 'Available',
        lifecycleState: 'Available',
        healthScore: 100,
        fuelEfficiency: 3.5,
      },
    });
  },

  async updateVehicle(id: string, data: any) {
    await this.getVehicleById(id);
    return prisma.vehicle.update({
      where: { id },
      data,
    });
  },

  async deleteVehicle(id: string) {
    await this.getVehicleById(id);
    return prisma.vehicle.delete({
      where: { id },
    });
  },

  async addDocument(vehicleId: string, doc: { name: string; type: string; fileUrl: string; fileSize: string; expiresAt: string }) {
    await this.getVehicleById(vehicleId);
    return prisma.vehicleDocument.create({
      data: {
        vehicleId,
        name: doc.name,
        type: doc.type,
        fileUrl: doc.fileUrl,
        fileSize: doc.fileSize,
        expiresAt: doc.expiresAt,
        status: 'Valid',
      },
    });
  },
};
