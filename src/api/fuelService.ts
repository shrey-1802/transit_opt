import { apiClient } from './apiClient';
import { fallbackStore } from './fallbackStore';
import { FuelLog, ExpenseRecord, OperationalCostSummary } from '../types/fuel';

export const fuelService = {
  async getFuelLogs(): Promise<FuelLog[]> {
    try {
      return await apiClient.get<FuelLog[]>('/fuel');
    } catch (err: any) {
      if (err.isNetworkFailure || err.status === 404) {
        return fallbackStore.getFuelLogs();
      }
      throw err;
    }
  },

  async logFuel(payload: Partial<FuelLog>): Promise<FuelLog> {
    try {
      return await apiClient.post<FuelLog>('/fuel', payload);
    } catch (err: any) {
      if (err.isNetworkFailure || err.status === 404) {
        return fallbackStore.addFuelLog(payload);
      }
      throw err;
    }
  },

  async getExpenses(): Promise<ExpenseRecord[]> {
    try {
      return await apiClient.get<ExpenseRecord[]>('/expenses');
    } catch (err: any) {
      if (err.isNetworkFailure || err.status === 404) {
        return fallbackStore.getExpenses();
      }
      throw err;
    }
  },

  async logExpense(payload: Partial<ExpenseRecord>): Promise<ExpenseRecord> {
    try {
      return await apiClient.post<ExpenseRecord>('/expenses', payload);
    } catch (err: any) {
      if (err.isNetworkFailure || err.status === 404) {
        return fallbackStore.addExpense(payload);
      }
      throw err;
    }
  },

  async getOperationalCostSummary(): Promise<OperationalCostSummary> {
    const fuels = await this.getFuelLogs();
    const exps = await this.getExpenses();

    const fuelCost = fuels.reduce((acc, f) => acc + f.totalCost, 0);
    const tollsCost = exps.filter(e => e.category === 'Toll').reduce((acc, e) => acc + e.amount, 0);
    const maintenanceCost = exps.filter(e => e.category === 'Maintenance').reduce((acc, e) => acc + e.amount, 0) + 5290;
    const otherExpensesCost = exps.filter(e => e.category !== 'Fuel' && e.category !== 'Toll' && e.category !== 'Maintenance').reduce((acc, e) => acc + e.amount, 0);

    const totalLitres = fuels.reduce((acc, f) => acc + f.liters, 0);
    const totalDist = fuels.reduce((acc, f) => acc + f.distanceSinceLastFill, 0);
    const averageFleetFuelEfficiency = totalLitres > 0 ? Number((totalDist / totalLitres).toFixed(2)) : 3.4;

    return {
      fuelCost: Math.round(fuelCost),
      maintenanceCost: Math.round(maintenanceCost),
      tollsCost: Math.round(tollsCost),
      otherExpensesCost: Math.round(otherExpensesCost),
      totalOperationalCost: Math.round(fuelCost + maintenanceCost + tollsCost + otherExpensesCost),
      averageFleetFuelEfficiency,
    };
  }
};
