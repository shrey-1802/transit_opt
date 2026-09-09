import { Request, Response, NextFunction } from 'express';
import { maintenanceService } from '../services/maintenanceService.js';
import { fuelService } from '../services/fuelService.js';
import { analyticsService } from '../services/analyticsService.js';
import { alertService } from '../services/alertService.js';
import { copilotService } from '../services/copilotService.js';

export const maintenanceController = {
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const records = await maintenanceService.getRecords();
      return res.status(200).json(records);
    } catch (err) {
      return next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const log = await maintenanceService.createMaintenance(req.body);
      return res.status(201).json(log);
    } catch (err) {
      return next(err);
    }
  },

  async close(req: Request, res: Response, next: NextFunction) {
    try {
      const record = await maintenanceService.closeMaintenance(req.params.id);
      return res.status(200).json(record);
    } catch (err) {
      return next(err);
    }
  },
};

export const fuelController = {
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const logs = await fuelService.getFuelLogs();
      return res.status(200).json(logs);
    } catch (err) {
      return next(err);
    }
  },

  async logFuel(req: Request, res: Response, next: NextFunction) {
    try {
      const log = await fuelService.logFuel(req.body);
      return res.status(201).json(log);
    } catch (err) {
      return next(err);
    }
  },

  async getExpenses(_req: Request, res: Response, next: NextFunction) {
    try {
      const expenses = await fuelService.getExpenses();
      return res.status(200).json(expenses);
    } catch (err) {
      return next(err);
    }
  },

  async logExpense(req: Request, res: Response, next: NextFunction) {
    try {
      const expense = await fuelService.logExpense(req.body);
      return res.status(201).json(expense);
    } catch (err) {
      return next(err);
    }
  },

  async getCostSummary(_req: Request, res: Response, next: NextFunction) {
    try {
      const summary = await fuelService.getOperationalCostSummary();
      return res.status(200).json(summary);
    } catch (err) {
      return next(err);
    }
  },
};

export const analyticsController = {
  async getDashboardKPIs(_req: Request, res: Response, next: NextFunction) {
    try {
      const kpis = await analyticsService.getDashboardKPIs();
      return res.status(200).json(kpis);
    } catch (err) {
      return next(err);
    }
  },

  async getRoiTrends(_req: Request, res: Response, next: NextFunction) {
    try {
      const trends = await analyticsService.getRoiTrends();
      return res.status(200).json(trends);
    } catch (err) {
      return next(err);
    }
  },

  async getFuelTrends(_req: Request, res: Response, next: NextFunction) {
    try {
      const trends = await analyticsService.getFuelTrends();
      return res.status(200).json(trends);
    } catch (err) {
      return next(err);
    }
  },

  async getMaintenanceTrends(_req: Request, res: Response, next: NextFunction) {
    try {
      const trends = await analyticsService.getMaintenanceTrends();
      return res.status(200).json(trends);
    } catch (err) {
      return next(err);
    }
  },

  async getVehicleRoiRankings(_req: Request, res: Response, next: NextFunction) {
    try {
      const rankings = await analyticsService.getVehicleRoiRankings();
      return res.status(200).json(rankings);
    } catch (err) {
      return next(err);
    }
  },
};

export const alertController = {
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const alerts = await alertService.getAlerts();
      return res.status(200).json(alerts);
    } catch (err) {
      return next(err);
    }
  },

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const alert = await alertService.markAsRead(req.params.id);
      return res.status(200).json(alert);
    } catch (err) {
      return next(err);
    }
  },
};

export const copilotController = {
  async query(req: Request, res: Response, next: NextFunction) {
    try {
      const { intent, parameter } = req.body;
      const result = await copilotService.executeIntent(intent, parameter);
      return res.status(200).json(result);
    } catch (err) {
      return next(err);
    }
  },
};

export const reportController = {
  async exportCsv(_req: Request, res: Response, next: NextFunction) {
    try {
      const rankings = await analyticsService.getVehicleRoiRankings();
      if (!rankings.length) {
        return res.status(200).send('No data');
      }
      const headers = Object.keys(rankings[0]);
      const csv = [
        headers.join(','),
        ...rankings.map(row => headers.map(h => `"${(row as any)[h] ?? ''}"`).join(',')),
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="TransitOps_ROI_Report.csv"');
      return res.status(200).send(csv);
    } catch (err) {
      return next(err);
    }
  },
};
