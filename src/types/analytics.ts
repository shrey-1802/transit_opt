export interface DashboardKPIs {
  activeVehicles: number;
  availableVehicles: number;
  vehiclesInMaintenance: number;
  activeTrips: number;
  pendingTrips: number;
  driversOnDuty: number;
  fleetUtilizationPercentage: number;
}

export interface RoiTrendPoint {
  month: string;
  revenue: number;
  operationalCost: number;
  netMargin: number;
  roiPercentage: number;
}

export interface FuelWeeklyTrendPoint {
  week: string;
  fuelCost: number;
  liters: number;
  averageKmPerL: number;
}

export interface MaintenanceCostTrendPoint {
  month: string;
  routineCost: number;
  repairCost: number;
  totalCost: number;
}

export interface VehicleRoiRanking {
  vehicleId: string;
  registrationNumber: string;
  model: string;
  type: string;
  revenue: number;
  totalCost: number;
  acquisitionCost: number;
  roiPercentage: number | null; // null if acquisition cost is zero
  rank: number;
}

export interface AnalyticsFilter {
  vehicleType?: string;
  status?: string;
  region?: string;
  dateRange?: '7d' | '30d' | '90d' | '1y' | 'all';
}
