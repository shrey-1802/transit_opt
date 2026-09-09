export type MaintenanceStatus = 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
export type MaintenancePriority = 'Routine' | 'Preventive' | 'Corrective' | 'Emergency' | 'High' | 'Medium' | 'Low' | 'Critical';

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  vehicleReg: string;
  type: string;
  priority: MaintenancePriority;
  description: string;
  startDate: string;
  completionDate?: string;
  cost: number;
  odometerAtService: number;
  status: MaintenanceStatus;
  technicianOrShop: string;
  partsReplaced?: string[];
  notes?: string;
  createdAt: string;
}

export interface VehicleServiceSchedule {
  vehicleId: string;
  vehicleReg: string;
  currentOdometer: number;
  lastServiceOdometer: number;
  serviceIntervalKm: number;
  nextServiceOdometer: number;
  remainingKm: number;
  isOverdue: boolean;
  progressPercent: number; // 0 - 100%
}
