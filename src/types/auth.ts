export type UserRole = 'fleet_manager' | 'dispatcher' | 'safety_officer' | 'financial_analyst';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  department?: string;
}

export interface AuthSession {
  token: string;
  refreshToken?: string;
  expiresAt: number;
  user: User;
}

export interface RolePermission {
  canManageVehicles: boolean;
  canDeleteVehicles: boolean;
  canManageDrivers: boolean;
  canSuspendDrivers: boolean;
  canCreateTrips: boolean;
  canDispatchTrips: boolean;
  canCompleteTrips: boolean;
  canManageMaintenance: boolean;
  canManageFuelExpenses: boolean;
  canViewReports: boolean;
  canExportReports: boolean;
  canManageUsers: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermission> = {
  fleet_manager: {
    canManageVehicles: true,
    canDeleteVehicles: true,
    canManageDrivers: false,
    canSuspendDrivers: false,
    canCreateTrips: false,
    canDispatchTrips: false,
    canCompleteTrips: false,
    canManageMaintenance: true,
    canManageFuelExpenses: false,
    canViewReports: true,
    canExportReports: true,
    canManageUsers: false,
  },
  dispatcher: {
    canManageVehicles: false,
    canDeleteVehicles: false,
    canManageDrivers: false,
    canSuspendDrivers: false,
    canCreateTrips: true,
    canDispatchTrips: true,
    canCompleteTrips: true,
    canManageMaintenance: false,
    canManageFuelExpenses: false,
    canViewReports: true,
    canExportReports: false,
    canManageUsers: false,
  },
  safety_officer: {
    canManageVehicles: false,
    canDeleteVehicles: false,
    canManageDrivers: true,
    canSuspendDrivers: true,
    canCreateTrips: false,
    canDispatchTrips: false,
    canCompleteTrips: false,
    canManageMaintenance: false,
    canManageFuelExpenses: false,
    canViewReports: true,
    canExportReports: true,
    canManageUsers: false,
  },
  financial_analyst: {
    canManageVehicles: false,
    canDeleteVehicles: false,
    canManageDrivers: false,
    canSuspendDrivers: false,
    canCreateTrips: false,
    canDispatchTrips: false,
    canCompleteTrips: false,
    canManageMaintenance: false,
    canManageFuelExpenses: true,
    canViewReports: true,
    canExportReports: true,
    canManageUsers: false,
  },
};

export const ROLE_LABELS: Record<UserRole, string> = {
  fleet_manager: 'Fleet Manager',
  dispatcher: 'Dispatcher',
  safety_officer: 'Safety Officer',
  financial_analyst: 'Financial Analyst',
};
