import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding TransitOps Production Database...');

  // 1. Seed Users for all 4 RBAC Roles
  const passwordHash = await bcrypt.hash('Admin@Transit2026!', 10);
  const otherPasswordHash = await bcrypt.hash('TransitOps2026!', 10);

  const users = [
    {
      email: 'admin@transitops.internal',
      name: 'Eleanor Vance',
      role: 'fleet_manager',
      department: 'Fleet & Asset Operations',
      passwordHash,
    },
    {
      email: 'carlos.mendez@transitops.internal',
      name: 'Carlos Mendez',
      role: 'dispatcher',
      department: 'Logistics Control Center',
      passwordHash: otherPasswordHash,
    },
    {
      email: 'raymond.holt@transitops.internal',
      name: 'Captain Raymond Holt',
      role: 'safety_officer',
      department: 'Compliance & Safety Directorate',
      passwordHash: otherPasswordHash,
    },
    {
      email: 'siddharth.n@transitops.internal',
      name: 'Siddharth Nair',
      role: 'financial_analyst',
      department: 'Capital & Operating Financial Analytics',
      passwordHash: otherPasswordHash,
    },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: u,
    });
  }

  // 2. Seed Vehicles
  const vehicles = [
    {
      registrationNumber: 'TRX-8821',
      model: 'Volvo FH16 750 Globetrotter',
      type: 'Heavy Truck',
      maxLoadCapacity: 25000,
      odometer: 142800,
      acquisitionCost: 165000,
      status: 'Available',
      lifecycleState: 'Available',
      healthScore: 94,
      fuelEfficiency: 3.4,
      lastServiceOdometer: 135000,
      serviceIntervalKm: 20000,
      region: 'North Corridor',
      year: 2022,
    },
    {
      registrationNumber: 'TRX-9410',
      model: 'Scania R500 V8 Streamline',
      type: 'Heavy Truck',
      maxLoadCapacity: 24000,
      odometer: 98450,
      acquisitionCost: 152000,
      status: 'On Trip',
      lifecycleState: 'On Trip',
      healthScore: 91,
      fuelEfficiency: 3.6,
      lastServiceOdometer: 90000,
      serviceIntervalKm: 20000,
      region: 'Central Hub',
      year: 2023,
    },
    {
      registrationNumber: 'TRX-7102',
      model: 'Mercedes-Benz Actros 2645',
      type: 'Semi-Trailer',
      maxLoadCapacity: 28000,
      odometer: 215300,
      acquisitionCost: 178000,
      status: 'In Shop',
      lifecycleState: 'Maintenance',
      healthScore: 68,
      fuelEfficiency: 3.1,
      lastServiceOdometer: 200000,
      serviceIntervalKm: 20000,
      region: 'Southern Link',
      year: 2021,
    },
    {
      registrationNumber: 'TRX-6399',
      model: 'MAN TGX 18.510 EfficientLine',
      type: 'Heavy Truck',
      maxLoadCapacity: 21000,
      odometer: 64200,
      acquisitionCost: 138000,
      status: 'Available',
      lifecycleState: 'Available',
      healthScore: 98,
      fuelEfficiency: 3.8,
      lastServiceOdometer: 60000,
      serviceIntervalKm: 15000,
      region: 'West Express',
      year: 2024,
    },
    {
      registrationNumber: 'TRX-4120',
      model: 'Ford Transit 350 Cargo High Roof',
      type: 'Van',
      maxLoadCapacity: 3500,
      odometer: 48900,
      acquisitionCost: 48000,
      status: 'Available',
      lifecycleState: 'Available',
      healthScore: 95,
      fuelEfficiency: 9.2,
      lastServiceOdometer: 45000,
      serviceIntervalKm: 15000,
      region: 'Metro Express',
      year: 2023,
    },
    {
      registrationNumber: 'TRX-2011',
      model: 'Isuzu Giga 6x4 Heavy Cargo',
      type: 'Flatbed',
      maxLoadCapacity: 19000,
      odometer: 382000,
      acquisitionCost: 115000,
      status: 'Retired',
      lifecycleState: 'Retired',
      healthScore: 42,
      fuelEfficiency: 2.8,
      lastServiceOdometer: 360000,
      serviceIntervalKm: 15000,
      region: 'North Corridor',
      year: 2017,
    },
  ];

  const createdVehicles: Record<string, any> = {};
  for (const v of vehicles) {
    const created = await prisma.vehicle.upsert({
      where: { registrationNumber: v.registrationNumber },
      update: {},
      create: v,
    });
    createdVehicles[v.registrationNumber] = created;
  }

  // 3. Seed Drivers
  const drivers = [
    {
      name: 'Marcus Vance',
      licenseNumber: 'CDL-A-882914',
      licenseCategory: 'Class A (CDL)',
      licenseExpiryDate: '2026-11-20',
      contactNumber: '+1 (555) 234-8901',
      email: 'marcus.vance@transitops.internal',
      status: 'Available',
      safetyScore: 96,
      tripsCompleted: 142,
      violationCount: 0,
      performanceScore: 98,
      joinedDate: '2022-04-10',
    },
    {
      name: 'Sarah Jenkins',
      licenseNumber: 'CDL-A-449102',
      licenseCategory: 'Class A (CDL)',
      licenseExpiryDate: '2026-09-22', // < 30 days!
      contactNumber: '+1 (555) 892-4112',
      email: 'sarah.j@transitops.internal',
      status: 'Available',
      safetyScore: 93,
      tripsCompleted: 118,
      violationCount: 1,
      performanceScore: 91,
      joinedDate: '2023-01-15',
    },
    {
      name: 'David Chen',
      licenseNumber: 'CDL-B-771239',
      licenseCategory: 'Class B (Heavy)',
      licenseExpiryDate: '2026-08-15', // EXPIRED!
      contactNumber: '+1 (555) 431-9022',
      email: 'david.chen@transitops.internal',
      status: 'Available',
      safetyScore: 84,
      tripsCompleted: 89,
      violationCount: 3,
      performanceScore: 82,
      joinedDate: '2023-07-22',
    },
    {
      name: 'Elena Rostova',
      licenseNumber: 'CDL-A-901844',
      licenseCategory: 'Class A (CDL)',
      licenseExpiryDate: '2027-04-18',
      contactNumber: '+1 (555) 672-0044',
      email: 'elena.r@transitops.internal',
      status: 'Suspended',
      safetyScore: 68,
      tripsCompleted: 64,
      violationCount: 4,
      performanceScore: 65,
      suspendedReason: 'Pending internal investigation for speeding violation in school zone (Report #SO-882)',
      joinedDate: '2024-03-05',
    },
    {
      name: 'James Wilson',
      licenseNumber: 'CDL-A-332910',
      licenseCategory: 'Class A (CDL)',
      licenseExpiryDate: '2027-01-10',
      contactNumber: '+1 (555) 912-7733',
      email: 'james.w@transitops.internal',
      status: 'On Trip',
      safetyScore: 95,
      tripsCompleted: 156,
      violationCount: 0,
      performanceScore: 97,
      assignedVehicleId: createdVehicles['TRX-9410']?.id,
      assignedVehicleReg: 'TRX-9410',
      joinedDate: '2021-11-01',
    },
    {
      name: 'Tariq Mansoor',
      licenseNumber: 'CDL-A-655291',
      licenseCategory: 'Class A (CDL)',
      licenseExpiryDate: '2027-08-30',
      contactNumber: '+1 (555) 301-4499',
      email: 'tariq.m@transitops.internal',
      status: 'Available',
      safetyScore: 99,
      tripsCompleted: 184,
      violationCount: 0,
      performanceScore: 99,
      joinedDate: '2021-05-18',
    },
  ];

  const createdDrivers: Record<string, any> = {};
  for (const d of drivers) {
    const created = await prisma.driver.upsert({
      where: { licenseNumber: d.licenseNumber },
      update: {},
      create: d,
    });
    createdDrivers[d.licenseNumber] = created;
  }

  // 4. Seed Trips
  const trip1 = await prisma.trip.upsert({
    where: { tripCode: 'TR-9021' },
    update: {},
    create: {
      tripCode: 'TR-9021',
      source: 'Chicago Logistics Terminal #4',
      destination: 'Detroit Auto Parts Distribution Hub',
      vehicleId: createdVehicles['TRX-9410']!.id,
      vehicleReg: 'TRX-9410',
      driverId: createdDrivers['CDL-A-332910']!.id,
      driverName: 'James Wilson',
      cargoDescription: 'Precision Transmission Sub-assemblies',
      cargoWeightKg: 18500,
      plannedDistanceKm: 460,
      startOdometer: 98450,
      revenue: 3450,
      status: 'Dispatched',
      dispatchedAt: new Date('2026-09-09T09:15:00Z'),
    },
  });

  await prisma.trip.upsert({
    where: { tripCode: 'TR-9020' },
    update: {},
    create: {
      tripCode: 'TR-9020',
      source: 'Indianapolis Distribution Center',
      destination: 'Columbus Freight Yard',
      vehicleId: createdVehicles['TRX-8821']!.id,
      vehicleReg: 'TRX-8821',
      driverId: createdDrivers['CDL-A-882914']!.id,
      driverName: 'Marcus Vance',
      cargoDescription: 'Pharmaceutical Medical Consumables (Cold-Chain)',
      cargoWeightKg: 14200,
      plannedDistanceKm: 285,
      actualDistanceKm: 290,
      startOdometer: 142510,
      finalOdometer: 142800,
      fuelConsumedLiters: 82,
      revenue: 2900,
      status: 'Completed',
      dispatchedAt: new Date('2026-09-08T07:10:00Z'),
      completedAt: new Date('2026-09-08T14:45:00Z'),
    },
  });

  // 5. Seed Maintenance
  await prisma.maintenanceLog.create({
    data: {
      vehicleId: createdVehicles['TRX-7102']!.id,
      vehicleReg: 'TRX-7102',
      type: 'Transmission Clutch Overhaul & Fluid Flush',
      priority: 'High',
      description: 'Noticeable slip in 6th gear; diagnostic error DTC P0730. Replacement of friction discs and valve body seals.',
      cost: 3250,
      odometerAtService: 215300,
      status: 'In Progress',
      technicianOrShop: 'Metro Heavy Diesel Specialists (Bay 4)',
      startDate: new Date('2026-09-07T08:00:00Z'),
    },
  });

  // 6. Seed Fuel & Expenses
  await prisma.fuelLog.create({
    data: {
      vehicleId: createdVehicles['TRX-8821']!.id,
      vehicleReg: 'TRX-8821',
      driverId: createdDrivers['CDL-A-882914']!.id,
      driverName: 'Marcus Vance',
      date: '2026-09-08',
      liters: 82.5,
      costPerLiter: 1.45,
      totalCost: 119.63,
      odometer: 142800,
      distanceSinceLastFill: 290,
      fuelEfficiencyKmPerL: 3.51,
      isAbnormalConsumption: false,
      stationName: 'Pilot Travel Center #412, Indianapolis',
    },
  });

  await prisma.expense.create({
    data: {
      category: 'Toll',
      vehicleId: createdVehicles['TRX-8821']!.id,
      vehicleReg: 'TRX-8821',
      tripId: trip1.id,
      amount: 46.50,
      date: '2026-09-08',
      description: 'I-69 / I-70 Electronic Toll Corridor Pass',
      receiptNumber: 'TOLL-8821-09',
      createdBy: 'Marcus Vance',
    },
  });

  // 7. Seed Alerts
  await prisma.alert.create({
    data: {
      type: 'license_expiry',
      severity: 'critical',
      title: 'License Expiry Imminent (< 14 Days)',
      description: 'Driver Sarah Jenkins (CDL-A-449102) license expires on 2026-09-22 (13 days remaining). Requires immediate renewal notification.',
      relatedEntityType: 'driver',
      relatedEntityId: createdDrivers['CDL-A-449102']!.id,
      actionUrl: '/drivers',
      actionLabel: 'Review Driver Compliance',
      timestamp: new Date('2026-09-09T00:00:00Z'),
    },
  });

  await prisma.alert.create({
    data: {
      type: 'vehicle_service_due',
      severity: 'warning',
      title: 'Odometer Service Milestone Approaching',
      description: 'Vehicle TRX-8821 is at 142,800 km. Next scheduled Service B at 155,000 km (12,200 km remaining).',
      relatedEntityType: 'vehicle',
      relatedEntityId: createdVehicles['TRX-8821']!.id,
      actionUrl: '/maintenance',
      actionLabel: 'Schedule Service',
      timestamp: new Date('2026-09-08T10:00:00Z'),
    },
  });

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
