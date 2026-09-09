import { apiClient } from './apiClient';
import { fallbackStore } from './fallbackStore';
import { MaintenanceRecord } from '../types/maintenance';

export const maintenanceService = {
  async getMaintenanceRecords(): Promise<MaintenanceRecord[]> {
    try {
      return await apiClient.get<MaintenanceRecord[]>('/maintenance');
    } catch (err: any) {
      if (err.isNetworkFailure || err.status === 404) {
        return fallbackStore.getMaintenanceRecords();
      }
      throw err;
    }
  },

  async createMaintenance(payload: Partial<MaintenanceRecord>): Promise<MaintenanceRecord> {
    try {
      return await apiClient.post<MaintenanceRecord>('/maintenance', payload);
    } catch (err: any) {
      if (err.isNetworkFailure || err.status === 404) {
        return fallbackStore.createMaintenance(payload);
      }
      throw err;
    }
  },

  async closeMaintenance(recordId: string): Promise<MaintenanceRecord> {
    try {
      return await apiClient.post<MaintenanceRecord>(`/maintenance/${recordId}/close`);
    } catch (err: any) {
      if (err.isNetworkFailure || err.status === 404) {
        return fallbackStore.closeMaintenance(recordId);
      }
      throw err;
    }
  }
};
