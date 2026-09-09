import { apiClient } from './apiClient';
import { fallbackStore } from './fallbackStore';
import { Alert } from '../types/alert';

export const alertsService = {
  async getAlerts(): Promise<Alert[]> {
    try {
      return await apiClient.get<Alert[]>('/alerts');
    } catch (err: any) {
      if (err.isNetworkFailure || err.status === 404) {
        return fallbackStore.getAlerts();
      }
      throw err;
    }
  },

  async markAsRead(alertId: string): Promise<void> {
    try {
      await apiClient.post(`/alerts/${alertId}/read`);
    } catch (err: any) {
      if (err.isNetworkFailure || err.status === 404) {
        fallbackStore.markAlertAsRead(alertId);
        return;
      }
      throw err;
    }
  }
};
