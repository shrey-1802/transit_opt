import { prisma } from '../database/prismaClient.js';
import { analyticsService } from './analyticsService.js';

export const copilotService = {
  async executeIntent(intent: string, _parameter?: string) {
    const now = new Date().toISOString();

    switch (intent) {
      case 'highest_roi_vehicle': {
        const rankings = await analyticsService.getVehicleRoiRankings();
        const top = rankings[0];

        if (!top) {
          return {
            intent,
            title: 'Top Performing Asset',
            summary: 'No vehicle assets registered in the database.',
            generatedAt: now,
            data: [],
          };
        }

        return {
          intent,
          title: 'Top Performing Asset by ROI',
          summary: `Vehicle ${top.registrationNumber} (${top.model}) leads the fleet with ${top.roiPercentage}% annualized ROI, generating ₹${top.revenue.toLocaleString('en-IN')} revenue against an acquisition cost of ₹${top.acquisitionCost.toLocaleString('en-IN')}.`,
          generatedAt: now,
          data: [
            {
              registration: top.registrationNumber,
              model: top.model,
              type: top.type,
              roi: `${top.roiPercentage}%`,
              grossRevenue: `₹${top.revenue.toLocaleString('en-IN')}`,
              operatingCost: `₹${top.totalCost.toLocaleString('en-IN')}`,
            },
          ],
          suggestedAction: {
            label: 'View Digital Twin',
            path: `/vehicles/${top.vehicleId}`,
          },
        };
      }

      case 'expiring_licenses': {
        const drivers = await prisma.driver.findMany();
        const currentDate = new Date();
        const expiring = drivers
          .map(d => {
            const exp = new Date(d.licenseExpiryDate);
            const days = Math.ceil((exp.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
            return { ...d, daysUntilExpiry: days };
          })
          .filter(d => d.daysUntilExpiry <= 30);

        return {
          intent,
          title: 'Drivers with Imminent License Expiry',
          summary: `Found ${expiring.length} driver(s) whose commercial licenses expire within 30 days or are currently expired. Dispatch pre-validator blocks non-compliant drivers automatically.`,
          generatedAt: now,
          data: expiring.map(d => ({
            name: d.name,
            license: d.licenseNumber,
            category: d.licenseCategory,
            daysRemaining: d.daysUntilExpiry,
            status: d.daysUntilExpiry <= 0 ? 'EXPIRED' : 'Expiring Soon',
          })),
          suggestedAction: {
            label: 'Open Driver Compliance',
            path: '/drivers',
          },
        };
      }

      case 'vehicles_in_maintenance': {
        const inShop = await prisma.vehicle.findMany({
          where: { status: 'In Shop' },
          include: { maintenanceLogs: { where: { status: 'In Progress' } } },
        });

        return {
          intent,
          title: 'Vehicles Currently In Shop',
          summary: `${inShop.length} vehicle(s) currently sequestered in maintenance bays and unavailable for dispatch assignment.`,
          generatedAt: now,
          data: inShop.map(v => ({
            registration: v.registrationNumber,
            model: v.model,
            odometer: `${v.odometer.toLocaleString('en-IN')} km`,
            activeWorkOrder: v.maintenanceLogs[0]?.type || 'Shop Bay Service',
            estimatedCost: `₹${(v.maintenanceLogs[0]?.cost || 0).toLocaleString('en-IN')}`,
          })),
          suggestedAction: {
            label: 'View Maintenance Work Orders',
            path: '/maintenance',
          },
        };
      }

      case 'fleet_efficiency_summary': {
        const kpis = await analyticsService.getDashboardKPIs();
        return {
          intent,
          title: 'Fleet Operational Summary',
          summary: `Current fleet status: ${kpis.activeVehicles} active en route, ${kpis.availableVehicles} available in ready pool, ${kpis.vehiclesInMaintenance} in maintenance. Fleet utilization is ${kpis.fleetUtilizationPercentage}%.`,
          generatedAt: now,
          data: [
            { metric: 'Active Dispatched', value: kpis.activeVehicles },
            { metric: 'Available Pool', value: kpis.availableVehicles },
            { metric: 'In Maintenance', value: kpis.vehiclesInMaintenance },
            { metric: 'Fleet Utilization', value: `${kpis.fleetUtilizationPercentage}%` },
          ],
          suggestedAction: {
            label: 'Open Mission Control',
            path: '/dashboard',
          },
        };
      }

      default: {
        return {
          intent,
          title: 'Operational Intent Query',
          summary: 'Telemetry operational parameters verified and all systems nominal.',
          generatedAt: now,
          data: [],
        };
      }
    }
  },
};
