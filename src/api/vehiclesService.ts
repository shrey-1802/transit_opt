import { apiClient } from './apiClient';
import { fallbackStore } from './fallbackStore';
import { Vehicle, VehicleDigitalTwinData, VehicleDocument } from '../types/vehicle';

export const vehiclesService = {
  async getVehicles(filters?: { type?: string; status?: string; region?: string }): Promise<Vehicle[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.type) params.append('type', filters.type);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.region) params.append('region', filters.region);
      const query = params.toString() ? `?${params.toString()}` : '';
      return await apiClient.get<Vehicle[]>(`/vehicles${query}`);
    } catch (err: any) {
      if (err.isNetworkFailure || err.status === 404) {
        let list = fallbackStore.getVehicles();
        if (filters?.type) list = list.filter(v => v.type === filters.type);
        if (filters?.status) list = list.filter(v => v.status === filters.status);
        if (filters?.region) list = list.filter(v => v.region === filters.region);
        return list;
      }
      throw err;
    }
  },

  async getVehicleById(id: string): Promise<Vehicle | null> {
    try {
      return await apiClient.get<Vehicle>(`/vehicles/${id}`);
    } catch (err: any) {
      if (err.isNetworkFailure || err.status === 404) {
        return fallbackStore.getVehicleById(id) || null;
      }
      throw err;
    }
  },

  async getVehicleDigitalTwin(id: string): Promise<VehicleDigitalTwinData | null> {
    try {
      return await apiClient.get<VehicleDigitalTwinData>(`/vehicles/${id}/digital-twin`);
    } catch (err: any) {
      if (err.isNetworkFailure || err.status === 404) {
        return fallbackStore.getVehicleDigitalTwin(id);
      }
      throw err;
    }
  },

  async createVehicle(payload: Partial<Vehicle>): Promise<Vehicle> {
    try {
      return await apiClient.post<Vehicle>('/vehicles', payload);
    } catch (err: any) {
      if (err.isNetworkFailure || err.status === 404) {
        return fallbackStore.addVehicle(payload);
      }
      throw err;
    }
  },

  async updateVehicle(id: string, updates: Partial<Vehicle>): Promise<Vehicle> {
    try {
      return await apiClient.put<Vehicle>(`/vehicles/${id}`, updates);
    } catch (err: any) {
      if (err.isNetworkFailure || err.status === 404) {
        return fallbackStore.updateVehicle(id, updates);
      }
      throw err;
    }
  },

  async deleteVehicle(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/vehicles/${id}`);
      return true;
    } catch (err: any) {
      if (err.isNetworkFailure || err.status === 404) {
        return fallbackStore.deleteVehicle(id);
      }
      throw err;
    }
  },

  async uploadDocument(vehicleId: string, file: File, type: string): Promise<VehicleDocument> {
    // Simulates or transmits document upload
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      const res = await fetch(`/api/v1/vehicles/${vehicleId}/documents`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiClient.getAuthToken() || ''}`,
        },
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      return await res.json();
    } catch {
      // Return simulated document metadata
      return {
        id: `doc-${Date.now()}`,
        vehicleId,
        name: file.name,
        type: type as any,
        fileUrl: URL.createObjectURL(file),
        fileSize: `${(file.size / 1024).toFixed(1)} KB`,
        uploadedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
        status: 'Valid',
      };
    }
  }
};
