import { z } from 'zod';

export const createVehicleSchema = z.object({
  registrationNumber: z.string().min(3, 'Registration number is required').toUpperCase(),
  model: z.string().min(2, 'Make and model are required'),
  type: z.enum(['Heavy Truck', 'Semi-Trailer', 'Van', 'Flatbed', 'Tanker']).default('Heavy Truck'),
  maxLoadCapacity: z.number().min(100, 'Capacity must be at least 100 kg'),
  odometer: z.number().min(0).default(0),
  acquisitionCost: z.number().min(0).default(100000),
  serviceIntervalKm: z.number().min(1000).default(20000),
  region: z.string().default('Central Hub'),
  year: z.number().min(1990).max(2035).default(2024),
});

export const updateVehicleSchema = createVehicleSchema.partial();
