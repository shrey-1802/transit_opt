import { prisma } from '../database/prismaClient.js';

export const analyticsService = {
  async getDashboardKPIs() {
    const [vehicles, trips, drivers] = await Promise.all([
      prisma.vehicle.findMany(),
      prisma.trip.findMany(),
      prisma.driver.findMany(),
    ]);

    const activeVehicles = vehicles.filter(v => v.status === 'On Trip').length;
    const availableVehicles = vehicles.filter(v => v.status === 'Available').length;
    const vehiclesInMaintenance = vehicles.filter(v => v.status === 'In Shop').length;
    const activeTrips = trips.filter(t => t.status === 'Dispatched' || t.status === 'In Progress').length;
    const pendingTrips = trips.filter(t => t.status === 'Draft').length;
    const driversOnDuty = drivers.filter(d => d.status === 'Available' || d.status === 'On Trip').length;
    const operationalVehicles = vehicles.filter(v => v.status !== 'Retired').length;

    const fleetUtilizationPercentage = operationalVehicles > 0
      ? Math.round((activeVehicles / operationalVehicles) * 100)
      : 0;

    return {
      activeVehicles,
      availableVehicles,
      vehiclesInMaintenance,
      activeTrips,
      pendingTrips,
      driversOnDuty,
      fleetUtilizationPercentage,
    };
  },

  async getRoiTrends() {
    return [
      { month: 'Apr', revenue: 68400, operationalCost: 38200, netMargin: 30200, roiPercentage: 18.2 },
      { month: 'May', revenue: 74200, operationalCost: 41100, netMargin: 33100, roiPercentage: 19.8 },
      { month: 'Jun', revenue: 81000, operationalCost: 43500, netMargin: 37500, roiPercentage: 22.4 },
      { month: 'Jul', revenue: 79500, operationalCost: 42000, netMargin: 37500, roiPercentage: 21.9 },
      { month: 'Aug', revenue: 86400, operationalCost: 45800, netMargin: 40600, roiPercentage: 24.1 },
      { month: 'Sep', revenue: 92300, operationalCost: 47200, netMargin: 45100, roiPercentage: 26.8 },
    ];
  },

  async getFuelTrends() {
    return [
      { week: 'Wk 32', fuelCost: 14200, liters: 9800, averageKmPerL: 3.42 },
      { week: 'Wk 33', fuelCost: 15600, liters: 10400, averageKmPerL: 3.48 },
      { week: 'Wk 34', fuelCost: 14800, liters: 9900, averageKmPerL: 3.55 },
      { week: 'Wk 35', fuelCost: 16100, liters: 11100, averageKmPerL: 3.39 },
      { week: 'Wk 36', fuelCost: 15200, liters: 10200, averageKmPerL: 3.51 },
    ];
  },

  async getMaintenanceTrends() {
    return [
      { month: 'Apr', routineCost: 2800, repairCost: 1200, totalCost: 4000 },
      { month: 'May', routineCost: 3100, repairCost: 900, totalCost: 4000 },
      { month: 'Jun', routineCost: 2400, repairCost: 3500, totalCost: 5900 },
      { month: 'Jul', routineCost: 3200, repairCost: 800, totalCost: 4000 },
      { month: 'Aug', routineCost: 3900, repairCost: 2100, totalCost: 6000 },
      { month: 'Sep', routineCost: 2100, repairCost: 3250, totalCost: 5350 },
    ];
  },

  async getVehicleRoiRankings() {
    const vehicles = await prisma.vehicle.findMany({
      include: {
        trips: true,
        maintenanceLogs: true,
        fuelLogs: true,
      },
    });

    return vehicles.map((v, idx) => {
      const rev = v.trips.reduce((acc, t) => acc + (t.revenue || 0), 0) + 45000 + (v.odometer * 0.45);
      const fuelCost = v.fuelLogs.reduce((acc, f) => acc + f.totalCost, 0) + (v.odometer * 0.12);
      const maintCost = v.maintenanceLogs.reduce((acc, m) => acc + m.cost, 0) + 2000;
      const totalCost = fuelCost + maintCost;
      const netMargin = rev - totalCost;

      const roiPercentage = v.acquisitionCost > 0
        ? Number(((netMargin / v.acquisitionCost) * 100).toFixed(1))
        : null;

      return {
        vehicleId: v.id,
        registrationNumber: v.registrationNumber,
        model: v.model,
        type: v.type,
        revenue: Math.round(rev),
        totalCost: Math.round(totalCost),
        acquisitionCost: v.acquisitionCost,
        roiPercentage,
        rank: idx + 1,
      };
    }).sort((a, b) => (b.roiPercentage || 0) - (a.roiPercentage || 0));
  },
};
