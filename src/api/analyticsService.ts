import { apiClient } from './apiClient';
import { fallbackStore } from './fallbackStore';
import { DashboardKPIs, RoiTrendPoint, FuelWeeklyTrendPoint, MaintenanceCostTrendPoint, VehicleRoiRanking } from '../types/analytics';

export const analyticsService = {
  async getDashboardKPIs(): Promise<DashboardKPIs> {
    try {
      return await apiClient.get<DashboardKPIs>('/analytics/dashboard-kpis');
    } catch (err: any) {
      if (err.isNetworkFailure || err.status === 404) {
        return fallbackStore.getDashboardKPIs();
      }
      throw err;
    }
  },

  async getRoiTrends(): Promise<RoiTrendPoint[]> {
    try {
      return await apiClient.get<RoiTrendPoint[]>('/analytics/roi-trends');
    } catch (err: any) {
      if (err.isNetworkFailure || err.status === 404) {
        return fallbackStore.getRoiTrends();
      }
      throw err;
    }
  },

  async getFuelWeeklyTrends(): Promise<FuelWeeklyTrendPoint[]> {
    try {
      return await apiClient.get<FuelWeeklyTrendPoint[]>('/analytics/fuel-trends');
    } catch (err: any) {
      if (err.isNetworkFailure || err.status === 404) {
        return [
          { week: 'Wk 32', fuelCost: 14200, liters: 9800, averageKmPerL: 3.42 },
          { week: 'Wk 33', fuelCost: 15600, liters: 10400, averageKmPerL: 3.48 },
          { week: 'Wk 34', fuelCost: 14800, liters: 9900, averageKmPerL: 3.55 },
          { week: 'Wk 35', fuelCost: 16100, liters: 11100, averageKmPerL: 3.39 },
          { week: 'Wk 36', fuelCost: 15200, liters: 10200, averageKmPerL: 3.51 },
        ];
      }
      throw err;
    }
  },

  async getMaintenanceTrends(): Promise<MaintenanceCostTrendPoint[]> {
    try {
      return await apiClient.get<MaintenanceCostTrendPoint[]>('/analytics/maintenance-trends');
    } catch (err: any) {
      if (err.isNetworkFailure || err.status === 404) {
        return [
          { month: 'Apr', routineCost: 2800, repairCost: 1200, totalCost: 4000 },
          { month: 'May', routineCost: 3100, repairCost: 900, totalCost: 4000 },
          { month: 'Jun', routineCost: 2400, repairCost: 3500, totalCost: 5900 },
          { month: 'Jul', routineCost: 3200, repairCost: 800, totalCost: 4000 },
          { month: 'Aug', routineCost: 3900, repairCost: 2100, totalCost: 6000 },
          { month: 'Sep', routineCost: 2100, repairCost: 3250, totalCost: 5350 },
        ];
      }
      throw err;
    }
  },

  async getVehicleRoiRankings(): Promise<VehicleRoiRanking[]> {
    const vehicles = fallbackStore.getVehicles();
    return vehicles.map((v, idx) => {
      const rev = 45000 + (v.odometer * 0.45);
      const cost = (v.odometer * 0.18) + 4000;
      const margin = rev - cost;
      const roi = v.acquisitionCost > 0 ? (margin / v.acquisitionCost) * 100 : null;
      return {
        vehicleId: v.id,
        registrationNumber: v.registrationNumber,
        model: v.model,
        type: v.type,
        revenue: Math.round(rev),
        totalCost: Math.round(cost),
        acquisitionCost: v.acquisitionCost,
        roiPercentage: roi ? Number(roi.toFixed(1)) : null,
        rank: idx + 1,
      };
    }).sort((a, b) => (b.roiPercentage || 0) - (a.roiPercentage || 0));
  },

  exportCsv(data: any[], filename: string): void {
    if (!data || !data.length) return;
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row =>
        headers.map(h => {
          const val = row[h];
          const escaped = ('' + (val ?? '')).replace(/"/g, '""');
          return `"${escaped}"`;
        }).join(',')
      )
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
