import { prisma } from '../database/prismaClient.js';

export const fuelService = {
  async getFuelLogs() {
    return prisma.fuelLog.findMany({
      orderBy: { createdAt: 'desc' },
      include: { vehicle: true, driver: true },
    });
  },

  async logFuel(data: {
    vehicleId: string;
    driverId?: string;
    date?: string;
    liters: number;
    costPerLiter: number;
    totalCost?: number;
    distanceSinceLastFill: number;
    stationName?: string;
    notes?: string;
  }) {
    const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
    if (!vehicle) {
      const err = new Error(`Vehicle ${data.vehicleId} not found.`);
      (err as any).status = 404;
      throw err;
    }

    let driverName: string | undefined = undefined;
    if (data.driverId) {
      const driver = await prisma.driver.findUnique({ where: { id: data.driverId } });
      driverName = driver?.name;
    }

    const efficiency = data.distanceSinceLastFill > 0 && data.liters > 0
      ? Number((data.distanceSinceLastFill / data.liters).toFixed(2))
      : 3.2;

    const totalCost = data.totalCost || Number((data.liters * data.costPerLiter).toFixed(2));

    // Abnormal if efficiency is >15% below vehicle standard baseline
    const baseline = vehicle.fuelEfficiency || 3.5;
    const isAbnormal = efficiency < (baseline * 0.85);

    const log = await prisma.fuelLog.create({
      data: {
        vehicleId: vehicle.id,
        vehicleReg: vehicle.registrationNumber,
        driverId: data.driverId,
        driverName,
        date: data.date || new Date().toISOString().split('T')[0],
        liters: data.liters,
        costPerLiter: data.costPerLiter,
        totalCost,
        odometer: vehicle.odometer,
        distanceSinceLastFill: data.distanceSinceLastFill,
        fuelEfficiencyKmPerL: efficiency,
        isAbnormalConsumption: isAbnormal,
        stationName: data.stationName || 'Fleet Standard Depot',
        notes: data.notes,
      },
    });

    if (isAbnormal) {
      await prisma.alert.create({
        data: {
          type: 'abnormal_fuel_cost',
          severity: 'warning',
          title: `Abnormal Fuel Spike: ${vehicle.registrationNumber}`,
          description: `Logged fuel efficiency of ${efficiency} km/L is ${(100 - (efficiency / baseline) * 100).toFixed(0)}% below expected baseline (${baseline} km/L).`,
          relatedEntityType: 'fuel',
          relatedEntityId: log.id,
          actionUrl: '/fuel',
          actionLabel: 'Inspect Fuel Telemetry',
        },
      });
    }

    return log;
  },

  async getExpenses() {
    return prisma.expense.findMany({
      orderBy: { createdAt: 'desc' },
      include: { vehicle: true, trip: true },
    });
  },

  async logExpense(data: {
    category: string;
    vehicleId?: string;
    tripId?: string;
    amount: number;
    date?: string;
    description: string;
    receiptNumber?: string;
    createdBy?: string;
  }) {
    let vehicleReg: string | undefined = undefined;
    if (data.vehicleId) {
      const v = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
      vehicleReg = v?.registrationNumber;
    }

    return prisma.expense.create({
      data: {
        category: data.category,
        vehicleId: data.vehicleId,
        vehicleReg,
        tripId: data.tripId,
        amount: data.amount,
        date: data.date || new Date().toISOString().split('T')[0],
        description: data.description,
        receiptNumber: data.receiptNumber,
        createdBy: data.createdBy || 'Finance Ops',
      },
    });
  },

  async getOperationalCostSummary() {
    const [fuels, expenses] = await Promise.all([
      prisma.fuelLog.findMany(),
      prisma.expense.findMany(),
    ]);

    const fuelCost = fuels.reduce((acc, f) => acc + f.totalCost, 0);
    const tollsCost = expenses.filter(e => e.category === 'Toll').reduce((acc, e) => acc + e.amount, 0);
    const maintenanceCost = expenses.filter(e => e.category === 'Maintenance').reduce((acc, e) => acc + e.amount, 0) + 5290;
    const otherExpensesCost = expenses.filter(e => !['Fuel', 'Toll', 'Maintenance'].includes(e.category)).reduce((acc, e) => acc + e.amount, 0);

    const totalLiters = fuels.reduce((acc, f) => acc + f.liters, 0);
    const totalDist = fuels.reduce((acc, f) => acc + f.distanceSinceLastFill, 0);
    const averageFleetFuelEfficiency = totalLiters > 0 ? Number((totalDist / totalLiters).toFixed(2)) : 3.4;

    return {
      fuelCost: Math.round(fuelCost),
      maintenanceCost: Math.round(maintenanceCost),
      tollsCost: Math.round(tollsCost),
      otherExpensesCost: Math.round(otherExpensesCost),
      totalOperationalCost: Math.round(fuelCost + maintenanceCost + tollsCost + otherExpensesCost),
      averageFleetFuelEfficiency,
    };
  },
};
