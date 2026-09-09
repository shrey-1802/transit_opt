export type TripStatus = 'Draft' | 'Dispatched' | 'In Progress' | 'Completed' | 'Cancelled';

export interface Trip {
  id: string;
  tripCode: string;
  source: string;
  destination: string;
  vehicleId: string;
  vehicleReg: string;
  driverId: string;
  driverName: string;
  cargoDescription: string;
  cargoWeightKg: number;
  plannedDistanceKm: number;
  actualDistanceKm?: number;
  startOdometer: number;
  finalOdometer?: number;
  fuelConsumedLiters?: number;
  revenue: number;
  status: TripStatus;
  createdAt: string;
  dispatchedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
}

export interface DispatchPreValidationResult {
  isValid: boolean;
  canDispatch: boolean;
  errors: string[];
  warnings: string[];
  vehicleCheck: {
    exists: boolean;
    isAvailable: boolean;
    isNotInShop: boolean;
    isNotRetired: boolean;
    maxCapacityKg: number;
    capacitySufficient: boolean;
  };
  driverCheck: {
    exists: boolean;
    isAvailable: boolean;
    isNotSuspended: boolean;
    isLicenseValid: boolean;
    daysUntilExpiry: number;
  };
}
