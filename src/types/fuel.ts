export interface FuelLog {
  id: string;
  vehicleId: string;
  vehicleReg: string;
  driverId?: string;
  driverName?: string;
  date: string;
  liters: number;
  costPerLiter: number;
  totalCost: number;
  odometer: number;
  distanceSinceLastFill: number;
  fuelEfficiencyKmPerL: number;
  isAbnormalConsumption: boolean;
  stationName: string;
  notes?: string;
}

export type ExpenseCategory = 'Fuel' | 'Maintenance' | 'Toll' | 'Permit & Licensing' | 'Insurance' | 'Driver Allowance' | 'Miscellaneous';

export interface ExpenseRecord {
  id: string;
  category: ExpenseCategory;
  vehicleId?: string;
  vehicleReg?: string;
  tripId?: string;
  amount: number;
  date: string;
  description: string;
  receiptNumber?: string;
  createdBy: string;
  createdAt: string;
}

export interface OperationalCostSummary {
  fuelCost: number;
  maintenanceCost: number;
  tollsCost: number;
  otherExpensesCost: number;
  totalOperationalCost: number;
  averageFleetFuelEfficiency: number;
}
