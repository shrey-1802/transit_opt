import { apiClient } from './apiClient';
import { fallbackStore } from './fallbackStore';
import { Driver } from '../types/driver';

export const driversService = {
  async getDrivers(): Promise<Driver[]> {
    try {
      return await apiClient.get<Driver[]>('/drivers');
    } catch (err: any) {
      if (err.isNetworkFailure || err.status === 404) {
        return fallbackStore.getDrivers();
      }
      throw err;
    }
  },

  async getDriverById(id: string): Promise<Driver | null> {
    try {
      return await apiClient.get<Driver>(`/drivers/${id}`);
    } catch (err: any) {
      if (err.isNetworkFailure || err.status === 404) {
        return fallbackStore.getDriverById(id) || null;
      }
      throw err;
    }
  },

  async suspendDriver(driverId: string, reason: string): Promise<Driver> {
    try {
      return await apiClient.post<Driver>(`/drivers/${driverId}/suspend`, { reason });
    } catch (err: any) {
      if (err.isNetworkFailure || err.status === 404) {
        return fallbackStore.suspendDriver(driverId, reason);
      }
      throw err;
    }
  },

  async reinstateDriver(driverId: string): Promise<Driver> {
    try {
      return await apiClient.post<Driver>(`/drivers/${driverId}/reinstate`);
    } catch (err: any) {
      if (err.isNetworkFailure || err.status === 404) {
        return fallbackStore.reinstateDriver(driverId);
      }
      throw err;
    }
  }
};
