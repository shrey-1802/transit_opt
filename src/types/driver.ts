export type DriverStatus = 'Available' | 'On Trip' | 'Off Duty' | 'Suspended';

export type LicenseCategory = 'Class A (CDL)' | 'Class B (Heavy)' | 'Class C (Standard)' | 'Hazardous Material';

export interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  licenseCategory: LicenseCategory;
  licenseExpiryDate: string; // ISO date YYYY-MM-DD
  contactNumber: string;
  email: string;
  status: DriverStatus;
  safetyScore: number; // 0 - 100
  tripsCompleted: number;
  violationCount: number;
  performanceScore: number; // calculated authoritative score
  assignedVehicleId?: string;
  assignedVehicleReg?: string;
  daysUntilExpiry: number;
  isLicenseValid: boolean;
  isExpiringSoon: boolean; // < 30 days
  suspendedReason?: string;
  joinedDate: string;
}

export interface DriverLicenseCheckResult {
  driverId: string;
  name: string;
  isValid: boolean;
  daysRemaining: number;
  statusMessage: string;
}
