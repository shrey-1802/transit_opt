export type AlertSeverity = 'critical' | 'warning' | 'info';

export type AlertType =
  | 'license_expiry'
  | 'vehicle_service_due'
  | 'maintenance_overdue'
  | 'abnormal_fuel_cost'
  | 'suspended_driver_attempt'
  | 'overloaded_cargo_attempt';

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  relatedEntityType?: 'vehicle' | 'driver' | 'trip' | 'maintenance' | 'fuel';
  relatedEntityId?: string;
  actionUrl?: string;
  actionLabel?: string;
}
