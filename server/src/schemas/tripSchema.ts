import { z } from 'zod';

export const validateDispatchSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle ID is required'),
  driverId: z.string().min(1, 'Driver ID is required'),
  cargoWeightKg: z.number().min(1, 'Cargo weight must be greater than 0'),
});

export const dispatchTripSchema = z.object({
  source: z.string().min(2, 'Origin facility is required'),
  destination: z.string().min(2, 'Destination hub is required'),
  vehicleId: z.string().min(1, 'Vehicle is required'),
  driverId: z.string().min(1, 'Driver is required'),
  cargoDescription: z.string().default('General Cargo'),
  cargoWeightKg: z.number().min(1, 'Cargo weight must be positive'),
  plannedDistanceKm: z.number().min(1, 'Planned distance is required'),
  revenue: z.number().min(0).default(0),
});

export const completeTripSchema = z.object({
  finalOdometer: z.number().min(0, 'Closing odometer is required'),
  fuelConsumedLiters: z.number().min(0).default(0),
});

export const cancelTripSchema = z.object({
  reason: z.string().min(3, 'Cancellation reason is required'),
});
