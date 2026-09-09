import { apiClient } from './apiClient';
import { fallbackStore } from './fallbackStore';
import { Trip, DispatchPreValidationResult } from '../types/trip';

export const dispatchService = {
  async getTrips(): Promise<Trip[]> {
    try {
      return await apiClient.get<Trip[]>('/trips');
    } catch (err: any) {
      if (err.isNetworkFailure || err.status === 404) {
        return fallbackStore.getTrips();
      }
      throw err;
    }
  },

  async validateDispatch(payload: {
    vehicleId: string;
    driverId: string;
    cargoWeightKg: number;
  }): Promise<DispatchPreValidationResult> {
    try {
      return await apiClient.post<DispatchPreValidationResult>('/trips/validate-dispatch', payload);
    } catch (err: any) {
      if (err.isNetworkFailure || err.status === 404) {
        return fallbackStore.validateDispatch(payload);
      }
      throw err;
    }
  },

  async dispatchTrip(payload: {
    source: string;
    destination: string;
    vehicleId: string;
    driverId: string;
    cargoDescription: string;
    cargoWeightKg: number;
    plannedDistanceKm: number;
    revenue: number;
  }): Promise<Trip> {
    try {
      return await apiClient.post<Trip>('/trips/dispatch', payload);
    } catch (err: any) {
      if (err.isNetworkFailure || err.status === 404) {
        return fallbackStore.dispatchTrip(payload);
      }
      throw err;
    }
  },

  async completeTrip(tripId: string, payload: { finalOdometer: number; fuelConsumedLiters: number }): Promise<Trip> {
    try {
      return await apiClient.post<Trip>(`/trips/${tripId}/complete`, payload);
    } catch (err: any) {
      if (err.isNetworkFailure || err.status === 404) {
        return fallbackStore.completeTrip(tripId, payload);
      }
      throw err;
    }
  },

  async cancelTrip(tripId: string, reason: string): Promise<Trip> {
    try {
      return await apiClient.post<Trip>(`/trips/${tripId}/cancel`, { reason });
    } catch (err: any) {
      if (err.isNetworkFailure || err.status === 404) {
        return fallbackStore.cancelTrip(tripId, reason);
      }
      throw err;
    }
  }
};
