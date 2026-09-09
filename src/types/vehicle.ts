export type VehicleStatus = 'Available' | 'On Trip' | 'In Shop' | 'Retired';

export type VehicleType = 'Heavy Truck' | 'Medium Cargo' | 'Van' | 'Semi-Trailer' | 'Flatbed' | 'Tanker';

export type VehicleLifecycleState = 'Purchased' | 'Available' | 'Assigned' | 'On Trip' | 'Maintenance' | 'Retired';

export interface VehicleDocument {
  id: string;
  vehicleId: string;
  name: string;
  type: 'Insurance' | 'Registration' | 'Emission Test' | 'Road Tax' | 'Inspection Certificate';
  fileUrl: string;
  fileSize: string;
  uploadedAt: string;
  expiresAt: string;
  status: 'Valid' | 'Expiring Soon' | 'Expired';
}

export interface Vehicle {
  id: string;
  registrationNumber: string;
  model: string;
  type: VehicleType;
  maxLoadCapacity: number; // in kg
  odometer: number; // in km
  acquisitionCost: number; // in USD
  status: VehicleStatus;
  lifecycleState: VehicleLifecycleState;
  healthScore: number; // 0 - 100
  fuelEfficiency: number; // km/L
  lastServiceOdometer: number;
  serviceIntervalKm: number;
  region: string;
  year: number;
  assignedDriverId?: string;
  assignedDriverName?: string;
  createdAt: string;
  updatedAt: string;
  documents?: VehicleDocument[];
}

export interface VehicleDigitalTwinData {
  vehicle: Vehicle;
  totalTripsCount: number;
  totalDistanceKm: number;
  totalFuelLiters: number;
  totalFuelCost: number;
  totalMaintenanceCost: number;
  totalRevenue: number;
  netProfit: number;
  roiPercentage: number | null; // (Revenue - (Maintenance + Fuel)) / Acquisition Cost * 100
  nextServiceOdometer: number;
  serviceProgressPercent: number; // progress toward next service
  recentTrips: any[];
  maintenanceTimeline: any[];
  fuelHistory: any[];
}
