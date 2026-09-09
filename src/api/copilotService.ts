import { apiClient } from './apiClient';
import { fallbackStore } from './fallbackStore';
import { CopilotQueryIntent, CopilotQueryResult } from '../types/copilot';

export const copilotService = {
  async executeIntent(intent: CopilotQueryIntent, parameter?: string): Promise<CopilotQueryResult> {
    try {
      return await apiClient.post<CopilotQueryResult>('/copilot/query', { intent, parameter });
    } catch (err: any) {
      if (err.isNetworkFailure || err.status === 404) {
        return fallbackStore.queryCopilot(intent);
      }
      throw err;
    }
  }
};
