import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('A valid corporate email address is required'),
  password: z.string().min(6, 'Password must contain at least 6 characters').optional(),
});

export const registerUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2),
  role: z.enum(['fleet_manager', 'dispatcher', 'safety_officer', 'financial_analyst']),
  department: z.string().optional(),
});
