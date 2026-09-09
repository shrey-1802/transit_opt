import { prisma } from '../database/prismaClient.js';

export const dispatchService = {
  async getTrips() {
    return prisma.trip.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        vehicle: true,
        driver: true,
      },
    });
  },

  async validateDispatch(data: { vehicleId: string; driverId: string; cargoWeightKg: number }) {
    const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
    const driver = await prisma.driver.findUnique({ where: { id: data.driverId } });

    const errors: string[] = [];
    const warnings: string[] = [];

    // Vehicle Checks
    const vehicleExists = !!vehicle;
    const vehicleAvailable = vehicle?.status === 'Available';
    const vehicleNotInShop = vehicle?.status !== 'In Shop';
    const vehicleNotRetired = vehicle?.status !== 'Retired';
    const maxCapacityKg = vehicle?.maxLoadCapacity || 0;
    const capacitySufficient = maxCapacityKg >= data.cargoWeightKg;

    if (!vehicleExists) {
      errors.push('Selected vehicle does not exist.');
    } else {
      if (!vehicleAvailable) {
        errors.push(`Vehicle ${vehicle.registrationNumber} is currently '${vehicle.status}' (must be Available).`);
      }
      if (!vehicleNotInShop) {
        errors.push(`Vehicle ${vehicle.registrationNumber} is currently undergoing maintenance In Shop.`);
      }
      if (!vehicleNotRetired) {
        errors.push(`Vehicle ${vehicle.registrationNumber} has been permanently Retired.`);
      }
      if (!capacitySufficient) {
        errors.push(
          `Cargo overload attempt: Payload (${data.cargoWeightKg.toLocaleString()} kg) exceeds vehicle max capacity (${maxCapacityKg.toLocaleString()} kg) by ${(data.cargoWeightKg - maxCapacityKg).toLocaleString()} kg.`
        );
      }
    }

    // Driver Checks
    const driverExists = !!driver;
    const driverAvailable = driver?.status === 'Available';
    const driverNotSuspended = driver?.status !== 'Suspended';

    let daysUntilExpiry = 0;
    let driverLicenseValid = false;

    if (!driverExists) {
      errors.push('Selected driver does not exist.');
    } else {
      const expiry = new Date(driver.licenseExpiryDate);
      daysUntilExpiry = Math.ceil((expiry.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      driverLicenseValid = daysUntilExpiry > 0;

      if (!driverAvailable) {
        errors.push(`Driver ${driver.name} is currently '${driver.status}' (must be Available).`);
      }
      if (!driverNotSuspended) {
        errors.push(`Driver ${driver.name} is SUSPENDED. Safety Officer disciplinary clearance required.`);
      }
      if (!driverLicenseValid) {
        errors.push(`Driver ${driver.name}'s license is EXPIRED (${driver.licenseNumber}). Dispatch prohibited by compliance policy.`);
      } else if (daysUntilExpiry <= 30) {
        warnings.push(`Driver ${driver.name}'s license will expire in ${daysUntilExpiry} days.`);
      }
    }

    const isValid = errors.length === 0;

    return {
      isValid,
      canDispatch: isValid,
      errors,
      warnings,
      vehicleCheck: {
        exists: vehicleExists,
        isAvailable: vehicleAvailable,
        isNotInShop: vehicleNotInShop,
        isNotRetired: vehicleNotRetired,
        maxCapacityKg,
        capacitySufficient,
      },
      driverCheck: {
        exists: driverExists,
        isAvailable: driverAvailable,
        isNotSuspended: driverNotSuspended,
        isLicenseValid: driverLicenseValid,
        daysUntilExpiry,
      },
    };
  },

  async dispatchTrip(data: {
    source: string;
    destination: string;
    vehicleId: string;
    driverId: string;
    cargoDescription: string;
    cargoWeightKg: number;
    plannedDistanceKm: number;
    revenue: number;
  }) {
    // Run authoritative server validation
    const validation = await this.validateDispatch({
      vehicleId: data.vehicleId,
      driverId: data.driverId,
      cargoWeightKg: data.cargoWeightKg,
    });

    if (!validation.isValid) {
      // Create security audit alert if suspended driver or overload was attempted
      if (validation.errors.some(e => e.includes('overload') || e.includes('SUSPENDED'))) {
        await prisma.alert.create({
          data: {
            type: validation.errors.some(e => e.includes('overload')) ? 'overloaded_cargo_attempt' : 'suspended_driver_attempt',
            severity: 'critical',
            title: 'Unauthorized Dispatch Attempt Blocked',
            description: validation.errors.join('; '),
            relatedEntityType: 'trip',
            actionUrl: '/dispatch',
            actionLabel: 'Audit Dispatch Engine',
          },
        });
      }

      const err = new Error(`Dispatch rejected by policy: ${validation.errors.join('; ')}`);
      (err as any).status = 422;
      (err as any).code = 'DISPATCH_VALIDATION_FAILED';
      (err as any).fieldErrors = { dispatch: validation.errors.join(', ') };
      throw err;
    }

    const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
    const driver = await prisma.driver.findUnique({ where: { id: data.driverId } });

    const tripCode = `TR-${Math.floor(1000 + Math.random() * 9000)}`;

    // ACID TRANSACTIONAL ATOMIC DISPATCH
    return prisma.$transaction(async (tx) => {
      // 1. Create Trip record
      const trip = await tx.trip.create({
        data: {
          tripCode,
          source: data.source,
          destination: data.destination,
          vehicleId: vehicle!.id,
          vehicleReg: vehicle!.registrationNumber,
          driverId: driver!.id,
          driverName: driver!.name,
          cargoDescription: data.cargoDescription,
          cargoWeightKg: data.cargoWeightKg,
          plannedDistanceKm: data.plannedDistanceKm,
          startOdometer: vehicle!.odometer,
          revenue: data.revenue || 0,
          status: 'Dispatched',
          dispatchedAt: new Date(),
        },
      });

      // 2. Set Vehicle = On Trip
      await tx.vehicle.update({
        where: { id: vehicle!.id },
        data: {
          status: 'On Trip',
          lifecycleState: 'On Trip',
          assignedDriverId: driver!.id,
          assignedDriverName: driver!.name,
        },
      });

      // 3. Set Driver = On Trip
      await tx.driver.update({
        where: { id: driver!.id },
        data: {
          status: 'On Trip',
          assignedVehicleId: vehicle!.id,
          assignedVehicleReg: vehicle!.registrationNumber,
        },
      });

      return trip;
    });
  },

  async completeTrip(tripId: string, data: { finalOdometer: number; fuelConsumedLiters?: number }) {
    const trip = await prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) {
      const err = new Error(`Trip ${tripId} not found.`);
      (err as any).status = 404;
      throw err;
    }

    const actualDistanceKm = Math.max(0, data.finalOdometer - trip.startOdometer);

    // ACID TRANSACTIONAL TRIP COMPLETION
    return prisma.$transaction(async (tx) => {
      // 1. Update trip
      const updatedTrip = await tx.trip.update({
        where: { id: tripId },
        data: {
          status: 'Completed',
          finalOdometer: data.finalOdometer,
          actualDistanceKm,
          fuelConsumedLiters: data.fuelConsumedLiters || 0,
          completedAt: new Date(),
        },
      });

      // 2. Restore vehicle to Available & update odometer
      await tx.vehicle.update({
        where: { id: trip.vehicleId },
        data: {
          status: 'Available',
          lifecycleState: 'Available',
          odometer: data.finalOdometer,
          assignedDriverId: null,
          assignedDriverName: null,
        },
      });

      // 3. Restore driver to Available & increment trips completed
      await tx.driver.update({
        where: { id: trip.driverId },
        data: {
          status: 'Available',
          tripsCompleted: { increment: 1 },
          assignedVehicleId: null,
          assignedVehicleReg: null,
        },
      });

      return updatedTrip;
    });
  },

  async cancelTrip(tripId: string, reason: string) {
    const trip = await prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) {
      const err = new Error(`Trip ${tripId} not found.`);
      (err as any).status = 404;
      throw err;
    }

    // ACID TRANSACTIONAL TRIP CANCELLATION
    return prisma.$transaction(async (tx) => {
      const updatedTrip = await tx.trip.update({
        where: { id: tripId },
        data: {
          status: 'Cancelled',
          cancellationReason: reason,
          cancelledAt: new Date(),
        },
      });

      // Restore vehicle if currently On Trip for this trip
      const vehicle = await tx.vehicle.findUnique({ where: { id: trip.vehicleId } });
      if (vehicle && vehicle.status === 'On Trip') {
        await tx.vehicle.update({
          where: { id: trip.vehicleId },
          data: {
            status: 'Available',
            lifecycleState: 'Available',
            assignedDriverId: null,
            assignedDriverName: null,
          },
        });
      }

      // Restore driver if currently On Trip for this trip
      const driver = await tx.driver.findUnique({ where: { id: trip.driverId } });
      if (driver && driver.status === 'On Trip') {
        await tx.driver.update({
          where: { id: trip.driverId },
          data: {
            status: 'Available',
            assignedVehicleId: null,
            assignedVehicleReg: null,
          },
        });
      }

      return updatedTrip;
    });
  },
};
