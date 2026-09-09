import { Vehicle, VehicleDocument } from '../types/vehicle';
import { Driver } from '../types/driver';
import { Trip, DispatchPreValidationResult } from '../types/trip';
import { MaintenanceRecord } from '../types/maintenance';
import { FuelLog, ExpenseRecord, OperationalCostSummary } from '../types/fuel';
import { DashboardKPIs, RoiTrendPoint, FuelWeeklyTrendPoint, MaintenanceCostTrendPoint, VehicleRoiRanking } from '../types/analytics';
import { Alert } from '../types/alert';
import { CopilotQueryIntent, CopilotQueryResult } from '../types/copilot';

// Initial Mock Data
let vehicles: Vehicle[] = [
  {
    id: 'veh-1',
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
    createdAt: '2022-03-15T08:00:00Z',
    updatedAt: '2026-03-01T10:30:00Z',
  },
  {
    id: 'veh-2',
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
    assignedDriverId: 'drv-5',
    assignedDriverName: 'James Wilson',
    createdAt: '2023-01-20T08:00:00Z',
    updatedAt: '2026-03-08T14:15:00Z',
  },
  {
    id: 'veh-3',
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
    createdAt: '2021-06-10T08:00:00Z',
    updatedAt: '2026-03-07T09:00:00Z',
  },
  {
    id: 'veh-4',
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
    createdAt: '2024-02-14T08:00:00Z',
    updatedAt: '2026-03-06T11:00:00Z',
  },
  {
    id: 'veh-5',
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
    createdAt: '2023-08-01T08:00:00Z',
    updatedAt: '2026-03-05T16:20:00Z',
  },
  {
    id: 'veh-6',
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
    createdAt: '2017-04-12T08:00:00Z',
    updatedAt: '2025-11-30T10:00:00Z',
  }
];

let drivers: Driver[] = [
  {
    id: 'drv-1',
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
    daysUntilExpiry: 72,
    isLicenseValid: true,
    isExpiringSoon: false,
    joinedDate: '2022-04-10',
  },
  {
    id: 'drv-2',
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
    daysUntilExpiry: 13,
    isLicenseValid: true,
    isExpiringSoon: true,
    joinedDate: '2023-01-15',
  },
  {
    id: 'drv-3',
    name: 'David Chen',
    licenseNumber: 'CDL-B-771239',
    licenseCategory: 'Class B (Heavy)',
    licenseExpiryDate: '2026-08-15', // EXPIRED!
    contactNumber: '+1 (555) 431-9022',
    email: 'david.chen@transitops.internal',
    status: 'Available', // but license invalid!
    safetyScore: 84,
    tripsCompleted: 89,
    violationCount: 3,
    performanceScore: 82,
    daysUntilExpiry: -25,
    isLicenseValid: false,
    isExpiringSoon: false,
    joinedDate: '2023-07-22',
  },
  {
    id: 'drv-4',
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
    daysUntilExpiry: 220,
    isLicenseValid: true,
    isExpiringSoon: false,
    suspendedReason: 'Pending internal investigation for speeding violation in school zone (Report #SO-882)',
    joinedDate: '2024-03-05',
  },
  {
    id: 'drv-5',
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
    assignedVehicleId: 'veh-2',
    assignedVehicleReg: 'TRX-9410',
    daysUntilExpiry: 123,
    isLicenseValid: true,
    isExpiringSoon: false,
    joinedDate: '2021-11-01',
  },
  {
    id: 'drv-6',
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
    daysUntilExpiry: 355,
    isLicenseValid: true,
    isExpiringSoon: false,
    joinedDate: '2021-05-18',
  }
];

let trips: Trip[] = [
  {
    id: 'trip-1',
    tripCode: 'TR-9021',
    source: 'Chicago Logistics Terminal #4',
    destination: 'Detroit Auto Parts Distribution Hub',
    vehicleId: 'veh-2',
    vehicleReg: 'TRX-9410',
    driverId: 'drv-5',
    driverName: 'James Wilson',
    cargoDescription: 'Precision Transmission Sub-assemblies',
    cargoWeightKg: 18500,
    plannedDistanceKm: 460,
    startOdometer: 98450,
    revenue: 3450,
    status: 'Dispatched',
    createdAt: '2026-09-09T08:30:00Z',
    dispatchedAt: '2026-09-09T09:15:00Z',
  },
  {
    id: 'trip-2',
    tripCode: 'TR-9020',
    source: 'Indianapolis Distribution Center',
    destination: 'Columbus Freight Yard',
    vehicleId: 'veh-1',
    vehicleReg: 'TRX-8821',
    driverId: 'drv-1',
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
    createdAt: '2026-09-08T06:00:00Z',
    dispatchedAt: '2026-09-08T07:10:00Z',
    completedAt: '2026-09-08T14:45:00Z',
  },
  {
    id: 'trip-3',
    tripCode: 'TR-9019',
    source: 'Milwaukee Cross-Dock Center',
    destination: 'Minneapolis Regional Hub',
    vehicleId: 'veh-4',
    vehicleReg: 'TRX-6399',
    driverId: 'drv-6',
    driverName: 'Tariq Mansoor',
    cargoDescription: 'Industrial Automation Sensors & PLCs',
    cargoWeightKg: 16000,
    plannedDistanceKm: 540,
    startOdometer: 64200,
    revenue: 4200,
    status: 'Draft',
    createdAt: '2026-09-09T14:00:00Z',
  }
];

let maintenanceRecords: MaintenanceRecord[] = [
  {
    id: 'maint-1',
    vehicleId: 'veh-3',
    vehicleReg: 'TRX-7102',
    type: 'Transmission Clutch Overhaul & Fluid Flush',
    priority: 'High',
    description: 'Noticeable slip in 6th gear; diagnostic error DTC P0730. Replacement of friction discs and valve body seals.',
    startDate: '2026-09-07T08:00:00Z',
    cost: 3250,
    odometerAtService: 215300,
    status: 'In Progress',
    technicianOrShop: 'Metro Heavy Diesel Specialists (Bay 4)',
    partsReplaced: ['Clutch Plate Kit', 'Dual-Mass Flywheel', 'Synthetic Gear Fluid 75W-90'],
    createdAt: '2026-09-07T07:30:00Z',
  },
  {
    id: 'maint-2',
    vehicleId: 'veh-1',
    vehicleReg: 'TRX-8821',
    type: 'Scheduled 135,000 km Service A',
    priority: 'Routine',
    description: 'Engine oil, fuel filter replacement, chassis lubrication, 54-point safety brake lining inspection.',
    startDate: '2026-08-15T09:00:00Z',
    completionDate: '2026-08-15T16:00:00Z',
    cost: 890,
    odometerAtService: 135000,
    status: 'Completed',
    technicianOrShop: 'Volvo Certified Central Service Depot',
    partsReplaced: ['Engine Oil 10W-40 (38L)', 'Fuel Filter Primary & Secondary', 'Cabin Air Filter'],
    createdAt: '2026-08-14T11:00:00Z',
  },
  {
    id: 'maint-3',
    vehicleId: 'veh-4',
    vehicleReg: 'TRX-6399',
    type: 'Brake Pad & Rotor Replacement',
    priority: 'Preventive',
    description: 'Front axle ceramic brake pad replacement; rotor resurfacing to eliminate vibration.',
    startDate: '2026-08-28T10:00:00Z',
    completionDate: '2026-08-28T15:30:00Z',
    cost: 1150,
    odometerAtService: 60000,
    status: 'Completed',
    technicianOrShop: 'Fleet Master Truck Repair',
    createdAt: '2026-08-27T14:20:00Z',
  }
];

let fuelLogs: FuelLog[] = [
  {
    id: 'fuel-1',
    vehicleId: 'veh-1',
    vehicleReg: 'TRX-8821',
    driverId: 'drv-1',
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
  {
    id: 'fuel-2',
    vehicleId: 'veh-2',
    vehicleReg: 'TRX-9410',
    driverId: 'drv-5',
    driverName: 'James Wilson',
    date: '2026-09-06',
    liters: 130.0,
    costPerLiter: 1.42,
    totalCost: 184.60,
    odometer: 98000,
    distanceSinceLastFill: 410,
    fuelEfficiencyKmPerL: 3.15,
    isAbnormalConsumption: false,
    stationName: 'Love\'s Travel Stop #709',
  },
  {
    id: 'fuel-3',
    vehicleId: 'veh-3',
    vehicleReg: 'TRX-7102',
    date: '2026-09-04',
    liters: 165.0,
    costPerLiter: 1.48,
    totalCost: 244.20,
    odometer: 215000,
    distanceSinceLastFill: 340,
    fuelEfficiencyKmPerL: 2.06, // Abnormal! Baseline is 3.1
    isAbnormalConsumption: true,
    stationName: 'TA Travel Center #118',
    notes: 'Fuel consumption spiked 33% above fleet baseline prior to transmission failure alert.',
  }
];

let expenses: ExpenseRecord[] = [
  {
    id: 'exp-1',
    category: 'Fuel',
    vehicleId: 'veh-1',
    vehicleReg: 'TRX-8821',
    tripId: 'trip-2',
    amount: 119.63,
    date: '2026-09-08',
    description: 'Pilot Travel Center Fuel Refill (82.5L diesel)',
    receiptNumber: 'REC-2026-9081',
    createdBy: 'Marcus Vance',
    createdAt: '2026-09-08T15:00:00Z',
  },
  {
    id: 'exp-2',
    category: 'Toll',
    vehicleId: 'veh-1',
    vehicleReg: 'TRX-8821',
    tripId: 'trip-2',
    amount: 46.50,
    date: '2026-09-08',
    description: 'I-69 / I-70 Electronic Toll Corridor Pass',
    receiptNumber: 'TOLL-8821-09',
    createdBy: 'Marcus Vance',
    createdAt: '2026-09-08T15:05:00Z',
  },
  {
    id: 'exp-3',
    category: 'Maintenance',
    vehicleId: 'veh-3',
    vehicleReg: 'TRX-7102',
    amount: 3250.00,
    date: '2026-09-07',
    description: 'Clutch Overhaul & Fluid Replacement (PO-7102-M)',
    receiptNumber: 'INV-DIESEL-894',
    createdBy: 'System Work Order',
    createdAt: '2026-09-07T08:00:00Z',
  }
];

let alerts: Alert[] = [
  {
    id: 'alt-1',
    type: 'license_expiry',
    severity: 'critical',
    title: 'License Expiry Imminent (< 14 Days)',
    description: 'Driver Sarah Jenkins (CDL-A-449102) license expires on 2026-09-22 (13 days remaining). Requires immediate renewal notification.',
    timestamp: '2026-09-09T00:00:00Z',
    isRead: false,
    relatedEntityType: 'driver',
    relatedEntityId: 'drv-2',
    actionUrl: '/drivers',
    actionLabel: 'Review Driver Compliance',
  },
  {
    id: 'alt-2',
    type: 'abnormal_fuel_cost',
    severity: 'warning',
    title: 'Abnormal Fuel Consumption Detected',
    description: 'Vehicle TRX-7102 recorded 2.06 km/L (33% below expected baseline 3.10 km/L) on route segment TA-118.',
    timestamp: '2026-09-05T14:30:00Z',
    isRead: false,
    relatedEntityType: 'vehicle',
    relatedEntityId: 'veh-3',
    actionUrl: '/fuel',
    actionLabel: 'Inspect Fuel Analytics',
  },
  {
    id: 'alt-3',
    type: 'vehicle_service_due',
    severity: 'warning',
    title: 'Odometer Service Milestone Approaching',
    description: 'Vehicle TRX-8821 is at 142,800 km. Next scheduled Service B at 155,000 km (12,200 km remaining).',
    timestamp: '2026-09-08T10:00:00Z',
    isRead: true,
    relatedEntityType: 'vehicle',
    relatedEntityId: 'veh-1',
    actionUrl: '/maintenance',
    actionLabel: 'Schedule Service',
  },
  {
    id: 'alt-4',
    type: 'suspended_driver_attempt',
    severity: 'critical',
    title: 'Disallowed Assignment Prevented',
    description: 'Automated policy rejected an attempt to assign Suspended driver Elena Rostova to trip request #TR-8994.',
    timestamp: '2026-09-06T11:20:00Z',
    isRead: true,
    relatedEntityType: 'driver',
    relatedEntityId: 'drv-4',
    actionUrl: '/alerts',
    actionLabel: 'View Audit Log',
  }
];

// In-Memory Stateful Engine
export const fallbackStore = {
  getVehicles: () => [...vehicles],
  
  getVehicleById: (id: string) => vehicles.find(v => v.id === id),

  addVehicle: (vehicleData: Partial<Vehicle>): Vehicle => {
    const newVehicle: Vehicle = {
      id: `veh-${Date.now()}`,
      registrationNumber: vehicleData.registrationNumber || `TRX-${Math.floor(1000 + Math.random() * 9000)}`,
      model: vehicleData.model || 'Heavy Hauler Freight',
      type: vehicleData.type || 'Heavy Truck',
      maxLoadCapacity: Number(vehicleData.maxLoadCapacity) || 20000,
      odometer: Number(vehicleData.odometer) || 0,
      acquisitionCost: Number(vehicleData.acquisitionCost) || 120000,
      status: 'Available',
      lifecycleState: 'Available',
      healthScore: 100,
      fuelEfficiency: 3.5,
      lastServiceOdometer: Number(vehicleData.odometer) || 0,
      serviceIntervalKm: Number(vehicleData.serviceIntervalKm) || 20000,
      region: vehicleData.region || 'Central Hub',
      year: Number(vehicleData.year) || 2024,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    vehicles.unshift(newVehicle);
    return newVehicle;
  },

  updateVehicle: (id: string, updates: Partial<Vehicle>): Vehicle => {
    const index = vehicles.findIndex(v => v.id === id);
    if (index === -1) throw new Error(`Vehicle ${id} not found`);
    vehicles[index] = { ...vehicles[index], ...updates, updatedAt: new Date().toISOString() };
    return vehicles[index];
  },

  deleteVehicle: (id: string): boolean => {
    const initialLen = vehicles.length;
    vehicles = vehicles.filter(v => v.id !== id);
    return vehicles.length < initialLen;
  },

  getVehicleDigitalTwin: (id: string): any => {
    const vehicle = vehicles.find(v => v.id === id);
    if (!vehicle) return null;

    const vehicleTrips = trips.filter(t => t.vehicleId === id);
    const vehicleMaint = maintenanceRecords.filter(m => m.vehicleId === id);
    const vehicleFuel = fuelLogs.filter(f => f.vehicleId === id);

    const totalRevenue = vehicleTrips.reduce((acc, t) => acc + (t.revenue || 0), 0) + (vehicle.acquisitionCost * 0.45);
    const totalFuelCost = vehicleFuel.reduce((acc, f) => acc + f.totalCost, 0) + (vehicle.odometer * 0.42);
    const totalMaintenanceCost = vehicleMaint.reduce((acc, m) => acc + m.cost, 0);
    const totalOperationalCost = totalFuelCost + totalMaintenanceCost;
    const netProfit = totalRevenue - totalOperationalCost;

    const roiPercentage = vehicle.acquisitionCost > 0
      ? ((netProfit / vehicle.acquisitionCost) * 100)
      : null;

    const nextServiceOdometer = vehicle.lastServiceOdometer + vehicle.serviceIntervalKm;
    const distanceTraveledSinceLast = Math.max(0, vehicle.odometer - vehicle.lastServiceOdometer);
    const serviceProgressPercent = Math.min(100, Math.round((distanceTraveledSinceLast / vehicle.serviceIntervalKm) * 100));

    return {
      vehicle,
      totalTripsCount: vehicleTrips.length + 14,
      totalDistanceKm: vehicle.odometer,
      totalFuelLiters: Math.round(totalFuelCost / 1.45),
      totalFuelCost: Math.round(totalFuelCost),
      totalMaintenanceCost: Math.round(totalMaintenanceCost),
      totalRevenue: Math.round(totalRevenue),
      netProfit: Math.round(netProfit),
      roiPercentage: roiPercentage ? Number(roiPercentage.toFixed(1)) : null,
      nextServiceOdometer,
      serviceProgressPercent,
      recentTrips: vehicleTrips,
      maintenanceTimeline: vehicleMaint,
      fuelHistory: vehicleFuel,
    };
  },

  getDrivers: () => [...drivers],

  getDriverById: (id: string) => drivers.find(d => d.id === id),

  suspendDriver: (id: string, reason: string): Driver => {
    const driver = drivers.find(d => d.id === id);
    if (!driver) throw new Error('Driver not found');
    driver.status = 'Suspended';
    driver.suspendedReason = reason;
    return { ...driver };
  },

  reinstateDriver: (id: string): Driver => {
    const driver = drivers.find(d => d.id === id);
    if (!driver) throw new Error('Driver not found');
    driver.status = 'Available';
    driver.suspendedReason = undefined;
    return { ...driver };
  },

  getTrips: () => [...trips],

  validateDispatch: (data: {
    vehicleId: string;
    driverId: string;
    cargoWeightKg: number;
  }): DispatchPreValidationResult => {
    const vehicle = vehicles.find(v => v.id === data.vehicleId);
    const driver = drivers.find(d => d.id === data.driverId);

    const errors: string[] = [];
    const warnings: string[] = [];

    // Vehicle validations
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
        errors.push(`Vehicle ${vehicle.registrationNumber} is currently ${vehicle.status} (must be Available).`);
      }
      if (!vehicleNotInShop) {
        errors.push(`Vehicle ${vehicle.registrationNumber} is undergoing maintenance In Shop.`);
      }
      if (!vehicleNotRetired) {
        errors.push(`Vehicle ${vehicle.registrationNumber} has been permanently Retired.`);
      }
      if (!capacitySufficient) {
        errors.push(
          `Cargo overload: Payload (${data.cargoWeightKg.toLocaleString()} kg) exceeds vehicle max capacity (${maxCapacityKg.toLocaleString()} kg) by ${(data.cargoWeightKg - maxCapacityKg).toLocaleString()} kg.`
        );
      }
    }

    // Driver validations
    const driverExists = !!driver;
    const driverAvailable = driver?.status === 'Available';
    const driverNotSuspended = driver?.status !== 'Suspended';
    const driverLicenseValid = !!driver && driver.isLicenseValid && driver.daysUntilExpiry > 0;

    if (!driverExists) {
      errors.push('Selected driver does not exist.');
    } else {
      if (!driverAvailable) {
        errors.push(`Driver ${driver.name} is currently ${driver.status} (must be Available).`);
      }
      if (!driverNotSuspended) {
        errors.push(`Driver ${driver.name} is SUSPENDED. Safety Officer clearance required.`);
      }
      if (!driverLicenseValid) {
        errors.push(`Driver ${driver.name}'s license is EXPIRED (${driver.licenseNumber}). Dispatch legally prohibited.`);
      } else if (driver.isExpiringSoon) {
        warnings.push(`Driver ${driver.name}'s license will expire in ${driver.daysUntilExpiry} days.`);
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
        daysUntilExpiry: driver?.daysUntilExpiry || 0,
      },
    };
  },

  dispatchTrip: (tripData: {
    source: string;
    destination: string;
    vehicleId: string;
    driverId: string;
    cargoDescription: string;
    cargoWeightKg: number;
    plannedDistanceKm: number;
    revenue: number;
  }): Trip => {
    // Validate rules
    const validation = fallbackStore.validateDispatch({
      vehicleId: tripData.vehicleId,
      driverId: tripData.driverId,
      cargoWeightKg: tripData.cargoWeightKg,
    });

    if (!validation.isValid) {
      throw new Error(`Dispatch rejected by policy: ${validation.errors.join('; ')}`);
    }

    const vehicle = vehicles.find(v => v.id === tripData.vehicleId)!;
    const driver = drivers.find(d => d.id === tripData.driverId)!;

    // Create Trip
    const newTrip: Trip = {
      id: `trip-${Date.now()}`,
      tripCode: `TR-${Math.floor(1000 + Math.random() * 9000)}`,
      source: tripData.source,
      destination: tripData.destination,
      vehicleId: vehicle.id,
      vehicleReg: vehicle.registrationNumber,
      driverId: driver.id,
      driverName: driver.name,
      cargoDescription: tripData.cargoDescription,
      cargoWeightKg: tripData.cargoWeightKg,
      plannedDistanceKm: tripData.plannedDistanceKm,
      startOdometer: vehicle.odometer,
      revenue: tripData.revenue,
      status: 'Dispatched',
      createdAt: new Date().toISOString(),
      dispatchedAt: new Date().toISOString(),
    };

    trips.unshift(newTrip);

    // ATOMIC STATE TRANSITION
    vehicle.status = 'On Trip';
    vehicle.lifecycleState = 'On Trip';
    vehicle.assignedDriverId = driver.id;
    vehicle.assignedDriverName = driver.name;

    driver.status = 'On Trip';
    driver.assignedVehicleId = vehicle.id;
    driver.assignedVehicleReg = vehicle.registrationNumber;

    return newTrip;
  },

  completeTrip: (tripId: string, payload: { finalOdometer: number; fuelConsumedLiters: number }): Trip => {
    const trip = trips.find(t => t.id === tripId);
    if (!trip) throw new Error('Trip not found');

    trip.status = 'Completed';
    trip.completedAt = new Date().toISOString();
    trip.finalOdometer = payload.finalOdometer;
    trip.fuelConsumedLiters = payload.fuelConsumedLiters;
    trip.actualDistanceKm = Math.max(0, payload.finalOdometer - trip.startOdometer);

    // ATOMIC RESTORATION
    const vehicle = vehicles.find(v => v.id === trip.vehicleId);
    if (vehicle) {
      vehicle.status = 'Available';
      vehicle.lifecycleState = 'Available';
      vehicle.odometer = payload.finalOdometer;
      vehicle.assignedDriverId = undefined;
      vehicle.assignedDriverName = undefined;
    }

    const driver = drivers.find(d => d.id === trip.driverId);
    if (driver) {
      driver.status = 'Available';
      driver.tripsCompleted += 1;
      driver.assignedVehicleId = undefined;
      driver.assignedVehicleReg = undefined;
    }

    return trip;
  },

  cancelTrip: (tripId: string, reason: string): Trip => {
    const trip = trips.find(t => t.id === tripId);
    if (!trip) throw new Error('Trip not found');

    trip.status = 'Cancelled';
    trip.cancelledAt = new Date().toISOString();
    trip.cancellationReason = reason;

    // Restore vehicle & driver if they were On Trip for this trip
    const vehicle = vehicles.find(v => v.id === trip.vehicleId);
    if (vehicle && vehicle.status === 'On Trip') {
      vehicle.status = 'Available';
      vehicle.lifecycleState = 'Available';
      vehicle.assignedDriverId = undefined;
      vehicle.assignedDriverName = undefined;
    }

    const driver = drivers.find(d => d.id === trip.driverId);
    if (driver && driver.status === 'On Trip') {
      driver.status = 'Available';
      driver.assignedVehicleId = undefined;
      driver.assignedVehicleReg = undefined;
    }

    return trip;
  },

  getMaintenanceRecords: () => [...maintenanceRecords],

  createMaintenance: (data: Partial<MaintenanceRecord>): MaintenanceRecord => {
    const vehicle = vehicles.find(v => v.id === data.vehicleId);
    if (!vehicle) throw new Error('Vehicle not found');

    const newRecord: MaintenanceRecord = {
      id: `maint-${Date.now()}`,
      vehicleId: vehicle.id,
      vehicleReg: vehicle.registrationNumber,
      type: data.type || 'Preventive Inspection',
      priority: data.priority || 'Routine',
      description: data.description || '',
      startDate: new Date().toISOString(),
      cost: Number(data.cost) || 0,
      odometerAtService: vehicle.odometer,
      status: 'In Progress',
      technicianOrShop: data.technicianOrShop || 'Central Maintenance Bay',
      createdAt: new Date().toISOString(),
    };

    maintenanceRecords.unshift(newRecord);

    // ATOMIC VEHICLE TO IN SHOP
    vehicle.status = 'In Shop';
    vehicle.lifecycleState = 'Maintenance';

    return newRecord;
  },

  closeMaintenance: (recordId: string): MaintenanceRecord => {
    const record = maintenanceRecords.find(r => r.id === recordId);
    if (!record) throw new Error('Maintenance record not found');

    record.status = 'Completed';
    record.completionDate = new Date().toISOString();

    const vehicle = vehicles.find(v => v.id === record.vehicleId);
    if (vehicle && vehicle.status !== 'Retired') {
      vehicle.status = 'Available';
      vehicle.lifecycleState = 'Available';
      vehicle.lastServiceOdometer = vehicle.odometer;
    }

    return record;
  },

  getFuelLogs: () => [...fuelLogs],

  addFuelLog: (data: Partial<FuelLog>): FuelLog => {
    const vehicle = vehicles.find(v => v.id === data.vehicleId);
    const liters = Number(data.liters) || 1;
    const distance = Number(data.distanceSinceLastFill) || 100;
    const efficiency = distance > 0 && liters > 0 ? Number((distance / liters).toFixed(2)) : 3.2;

    // Abnormal if efficiency is below 2.5 km/L for heavy trucks
    const isAbnormal = efficiency < 2.5;

    const newLog: FuelLog = {
      id: `fuel-${Date.now()}`,
      vehicleId: data.vehicleId || '',
      vehicleReg: vehicle?.registrationNumber || 'TRX-UNKNOWN',
      driverId: data.driverId,
      driverName: data.driverName,
      date: data.date || new Date().toISOString().split('T')[0],
      liters,
      costPerLiter: Number(data.costPerLiter) || 1.45,
      totalCost: Number(data.totalCost) || Number((liters * 1.45).toFixed(2)),
      odometer: Number(data.odometer) || (vehicle?.odometer || 0),
      distanceSinceLastFill: distance,
      fuelEfficiencyKmPerL: efficiency,
      isAbnormalConsumption: isAbnormal,
      stationName: data.stationName || 'Fleet Standard Depot',
      notes: data.notes,
    };

    fuelLogs.unshift(newLog);

    if (isAbnormal && vehicle) {
      alerts.unshift({
        id: `alt-${Date.now()}`,
        type: 'abnormal_fuel_cost',
        severity: 'warning',
        title: `Abnormal Fuel Spike: ${vehicle.registrationNumber}`,
        description: `Logged fuel efficiency of ${efficiency} km/L is significantly below fleet standard.`,
        timestamp: new Date().toISOString(),
        isRead: false,
        relatedEntityType: 'fuel',
        relatedEntityId: newLog.id,
      });
    }

    return newLog;
  },

  getExpenses: () => [...expenses],

  addExpense: (data: Partial<ExpenseRecord>): ExpenseRecord => {
    const newExpense: ExpenseRecord = {
      id: `exp-${Date.now()}`,
      category: data.category || 'Miscellaneous',
      vehicleId: data.vehicleId,
      vehicleReg: data.vehicleReg,
      tripId: data.tripId,
      amount: Number(data.amount) || 0,
      date: data.date || new Date().toISOString().split('T')[0],
      description: data.description || '',
      receiptNumber: data.receiptNumber,
      createdBy: data.createdBy || 'Finance Ops',
      createdAt: new Date().toISOString(),
    };
    expenses.unshift(newExpense);
    return newExpense;
  },

  getDashboardKPIs: (): DashboardKPIs => {
    const activeVehicles = vehicles.filter(v => v.status === 'On Trip').length;
    const availableVehicles = vehicles.filter(v => v.status === 'Available').length;
    const vehiclesInMaintenance = vehicles.filter(v => v.status === 'In Shop').length;
    const activeTrips = trips.filter(t => t.status === 'Dispatched' || t.status === 'In Progress').length;
    const pendingTrips = trips.filter(t => t.status === 'Draft').length;
    const driversOnDuty = drivers.filter(d => d.status === 'Available' || d.status === 'On Trip').length;
    const operationalVehicles = vehicles.filter(v => v.status !== 'Retired').length;
    const fleetUtilizationPercentage = operationalVehicles > 0
      ? Math.round((activeVehicles / operationalVehicles) * 100)
      : 0;

    return {
      activeVehicles,
      availableVehicles,
      vehiclesInMaintenance,
      activeTrips,
      pendingTrips,
      driversOnDuty,
      fleetUtilizationPercentage,
    };
  },

  getRoiTrends: (): RoiTrendPoint[] => [
    { month: 'Apr', revenue: 68400, operationalCost: 38200, netMargin: 30200, roiPercentage: 18.2 },
    { month: 'May', revenue: 74200, operationalCost: 41100, netMargin: 33100, roiPercentage: 19.8 },
    { month: 'Jun', revenue: 81000, operationalCost: 43500, netMargin: 37500, roiPercentage: 22.4 },
    { month: 'Jul', revenue: 79500, operationalCost: 42000, netMargin: 37500, roiPercentage: 21.9 },
    { month: 'Aug', revenue: 86400, operationalCost: 45800, netMargin: 40600, roiPercentage: 24.1 },
    { month: 'Sep', revenue: 92300, operationalCost: 47200, netMargin: 45100, roiPercentage: 26.8 },
  ],

  getAlerts: () => [...alerts],

  markAlertAsRead: (alertId: string) => {
    const alert = alerts.find(a => a.id === alertId);
    if (alert) alert.isRead = true;
    return alert;
  },

  queryCopilot: (intent: CopilotQueryIntent): CopilotQueryResult => {
    const now = new Date().toISOString();
    switch (intent) {
      case 'highest_roi_vehicle': {
        const topVehicle = vehicles[0];
        return {
          intent,
          title: 'Top Performing Asset by ROI',
          summary: `Vehicle ${topVehicle.registrationNumber} (${topVehicle.model}) leads the fleet with an estimated 34.2% annualized ROI, generating $68,400 net margin against an acquisition cost of $165,000.`,
          generatedAt: now,
          data: [
            { registration: topVehicle.registrationNumber, model: topVehicle.model, roi: '34.2%', fuelEfficiency: '3.4 km/L', status: topVehicle.status }
          ],
          suggestedAction: {
            label: 'View Vehicle Digital Twin',
            path: `/vehicles/${topVehicle.id}`,
          }
        };
      }
      case 'expiring_licenses': {
        const expiring = drivers.filter(d => d.daysUntilExpiry <= 30);
        return {
          intent,
          title: 'Drivers with Imminent License Expiry',
          summary: `Found ${expiring.length} driver(s) whose commercial driver licenses expire in under 30 days or are already expired. Dispatch pre-validator automatically blocks non-compliant drivers.`,
          generatedAt: now,
          data: expiring.map(d => ({
            name: d.name,
            license: d.licenseNumber,
            daysRemaining: d.daysUntilExpiry,
            status: d.daysUntilExpiry <= 0 ? 'EXPIRED' : 'Expiring Soon'
          })),
          suggestedAction: {
            label: 'Open Driver Compliance Matrix',
            path: '/drivers',
          }
        };
      }
      case 'vehicles_in_maintenance': {
        const inShop = vehicles.filter(v => v.status === 'In Shop');
        return {
          intent,
          title: 'Vehicles Currently In Shop',
          summary: `${inShop.length} vehicle(s) currently sequestered in maintenance bays and unavailable for dispatch.`,
          generatedAt: now,
          data: inShop.map(v => ({
            registration: v.registrationNumber,
            model: v.model,
            odometer: `${v.odometer.toLocaleString()} km`,
            shopStatus: 'In Shop (Locked)'
          })),
          suggestedAction: {
            label: 'View Maintenance Work Orders',
            path: '/maintenance',
          }
        };
      }
      default: {
        return {
          intent,
          title: 'Fleet Operational Summary',
          summary: 'All operational parameters monitored. 6 vehicles indexed, 6 commercial drivers verified, dispatch engine running state-machine safety checks.',
          generatedAt: now,
          data: [],
        };
      }
    }
  }
};
