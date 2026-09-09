import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { authService } from '../src/services/authService.js';

describe('Authentication & RBAC Enforcement', () => {
  it('1. Authenticates valid operator with JWT token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'eleanor.vance@transitops.internal',
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.role).toBe('fleet_manager');
  });

  it('2. Enforces RBAC 403 Forbidden when role lacks permission', async () => {
    // Financial analyst cannot dispatch trips
    const faAuth = await authService.login('siddharth.n@transitops.internal');

    const res = await request(app)
      .post('/api/v1/trips/dispatch')
      .set('Authorization', `Bearer ${faAuth.token}`)
      .send({
        source: 'A',
        destination: 'B',
        vehicleId: 'some-id',
        driverId: 'some-id',
        cargoWeightKg: 1000,
        plannedDistanceKm: 100,
      });

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('FORBIDDEN');
  });

  it('3. Rejects unauthenticated requests with 401 Unauthorized', async () => {
    const res = await request(app).post('/api/v1/vehicles').send({});
    expect(res.status).toBe(401);
  });
});
