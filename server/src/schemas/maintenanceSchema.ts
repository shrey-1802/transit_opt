import { z } from 'zod';

export const createMaintenanceSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle ID is required'),
  type: z.string().min(2, 'Maintenance description is required'),
  priority: z.enum(['Routine', 'Preventive', 'Corrective', 'Emergency', 'High']).default('Routine'),
  description: z.string().optional(),
  cost: z.number().min(0).default(0),
  technicianOrShop: z.string().default('Central Maintenance Bay'),
});

export const logFuelSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle ID is required'),
  driverId: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  liters: z.number().min(0.1, 'Liters must be positive'),
  costPerLiter: z.number().min(0.01).default(1.45),
  totalCost: z.number().min(0).optional(),
  distanceSinceLastFill: z.number().min(0).default(100),
  stationName: z.string().default('Standard Fleet Depot'),
  notes: z.string().optional(),
});

export const logExpenseSchema = z.object({
  category: z.enum(['Fuel', 'Maintenance', 'Toll', 'Permit & Licensing', 'Insurance', 'Driver Allowance', 'Miscellaneous']),
  vehicleId: z.string().optional(),
  tripId: z.string().optional(),
  amount: z.number().min(0.01, 'Amount must be positive'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  description: z.string().min(2, 'Description is required'),
  receiptNumber: z.string().optional(),
});

export const copilotQuerySchema = z.object({
  intent: z.enum([
    'highest_roi_vehicle',
    'expiring_licenses',
    'vehicles_in_maintenance',
    'fleet_efficiency_summary',
    'top_performing_drivers',
    'overdue_service_vehicles'
  ]),
  parameter: z.string().optional(),
});
