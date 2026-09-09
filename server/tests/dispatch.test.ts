import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { prisma } from '../src/database/prismaClient.js';
import { authService } from '../src/services/authService.js';

describe('Smart Dispatch Engine & Business Rules', () => {
  let dispatcherToken: string;
  let fleetManagerToken: string;
  let availableVehicleId: string;
  let inShopVehicleId: string;
  let availableDriverId: string;
  let expiredDriverId: string;
  let suspendedDriverId: string;

  beforeAll(async () => {
    // Generate auth tokens for testing
    const dispAuth = await authService.login('carlos.mendez@transitops.internal');
    dispatcherToken = dispAuth.token;

    const fmAuth = await authService.login('eleanor.vance@transitops.internal');
    fleetManagerToken = fmAuth.token;

    // Fetch seed records
    const vAvailable = await prisma.vehicle.findFirst({ where: { status: 'Available' } });
    availableVehicleId = vAvailable!.id;

    const vInShop = await prisma.vehicle.findFirst({ where: { status: 'In Shop' } });
    inShopVehicleId = vInShop!.id;

    const dAvailable = await prisma.driver.findFirst({ where: { status: 'Available', licenseNumber: 'CDL-A-882914' } });
    availableDriverId = dAvailable!.id;

    const dExpired = await prisma.driver.findFirst({ where: { licenseNumber: 'CDL-B-771239' } });
    expiredDriverId = dExpired!.id;

    const dSuspended = await prisma.driver.findFirst({ where: { status: 'Suspended' } });
    suspendedDriverId = dSuspended!.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('1. Rejects dispatch when cargo weight exceeds vehicle maximum load capacity', async () => {
    const res = await request(app)
      .post('/api/v1/trips/dispatch')
      .set('Authorization', `Bearer ${dispatcherToken}`)
      .send({
        source: 'Test Yard A',
        destination: 'Test Yard B',
        vehicleId: availableVehicleId,
        driverId: availableDriverId,
        cargoDescription: 'Massive Industrial Generator',
        cargoWeightKg: 999999, // Exceeds 25,000 kg capacity!
        plannedDistanceKm: 150,
        revenue: 2000,
      });

    expect(res.status).toBe(422);
    expect(res.body.code).toBe('DISPATCH_VALIDATION_FAILED');
    expect(res.body.message).toContain('Cargo overload attempt');
  });

  it('2. Rejects dispatch when selected driver has an expired commercial license', async () => {
    const res = await request(app)
      .post('/api/v1/trips/dispatch')
      .set('Authorization', `Bearer ${dispatcherToken}`)
      .send({
        source: 'Test Yard A',
        destination: 'Test Yard B',
        vehicleId: availableVehicleId,
        driverId: expiredDriverId,
        cargoWeightKg: 5000,
        plannedDistanceKm: 150,
        revenue: 2000,
      });

    expect(res.status).toBe(422);
    expect(res.body.message).toContain('EXPIRED');
  });

  it('3. Rejects dispatch when selected driver is Suspended', async () => {
    const res = await request(app)
      .post('/api/v1/trips/dispatch')
      .set('Authorization', `Bearer ${dispatcherToken}`)
      .send({
        source: 'Test Yard A',
        destination: 'Test Yard B',
        vehicleId: availableVehicleId,
        driverId: suspendedDriverId,
        cargoWeightKg: 5000,
        plannedDistanceKm: 150,
        revenue: 2000,
      });

    expect(res.status).toBe(422);
    expect(res.body.message).toContain('SUSPENDED');
  });

  it('4. Rejects dispatch when vehicle is In Shop (under maintenance)', async () => {
    const res = await request(app)
      .post('/api/v1/trips/dispatch')
      .set('Authorization', `Bearer ${dispatcherToken}`)
      .send({
        source: 'Test Yard A',
        destination: 'Test Yard B',
        vehicleId: inShopVehicleId,
        driverId: availableDriverId,
        cargoWeightKg: 5000,
        plannedDistanceKm: 150,
        revenue: 2000,
      });

    expect(res.status).toBe(422);
    expect(res.body.message).toContain('In Shop');
  });

  it('5. Dispatches successfully and atomically transitions trip, vehicle, and driver to On Trip', async () => {
    const res = await request(app)
      .post('/api/v1/trips/dispatch')
      .set('Authorization', `Bearer ${dispatcherToken}`)
      .send({
        source: 'Chicago Hub',
        destination: 'St. Louis Depot',
        vehicleId: availableVehicleId,
        driverId: availableDriverId,
        cargoDescription: 'Electronics Components',
        cargoWeightKg: 12000,
        plannedDistanceKm: 480,
        revenue: 3800,
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('Dispatched');

    const updatedVehicle = await prisma.vehicle.findUnique({ where: { id: availableVehicleId } });
    const updatedDriver = await prisma.driver.findUnique({ where: { id: availableDriverId } });

    expect(updatedVehicle?.status).toBe('On Trip');
    expect(updatedDriver?.status).toBe('On Trip');

    // Complete the trip to restore resources
    const completeRes = await request(app)
      .post(`/api/v1/trips/${res.body.id}/complete`)
      .set('Authorization', `Bearer ${dispatcherToken}`)
      .send({
        finalOdometer: updatedVehicle!.odometer + 480,
        fuelConsumedLiters: 140,
      });

    expect(completeRes.status).toBe(200);

    const restoredVehicle = await prisma.vehicle.findUnique({ where: { id: availableVehicleId } });
    const restoredDriver = await prisma.driver.findUnique({ where: { id: availableDriverId } });

    expect(restoredVehicle?.status).toBe('Available');
    expect(restoredDriver?.status).toBe('Available');
  });
});
