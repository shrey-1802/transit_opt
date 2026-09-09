import { z } from 'zod';

export const createDriverSchema = z.object({
  name: z.string().min(2, 'Full name is required'),
  licenseNumber: z.string().min(4, 'License number is required').toUpperCase(),
  licenseCategory: z.enum(['Class A (CDL)', 'Class B (Heavy)', 'Class C (Standard)']).default('Class A (CDL)'),
  licenseExpiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expiry date must be in YYYY-MM-DD format'),
  contactNumber: z.string().min(7, 'Contact number is required'),
  email: z.string().email('Valid email is required'),
  joinedDate: z.string().optional(),
});

export const suspendDriverSchema = z.object({
  reason: z.string().min(5, 'A clear reason for suspension is required'),
});
