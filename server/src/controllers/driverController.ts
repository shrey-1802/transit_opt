import { Request, Response, NextFunction } from 'express';
import { driverService } from '../services/driverService.js';

export const driverController = {
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const drivers = await driverService.getDrivers();
      return res.status(200).json(drivers);
    } catch (err) {
      return next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const driver = await driverService.getDriverById(req.params.id);
      return res.status(200).json(driver);
    } catch (err) {
      return next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const driver = await driverService.createDriver(req.body);
      return res.status(201).json(driver);
    } catch (err) {
      return next(err);
    }
  },

  async suspend(req: Request, res: Response, next: NextFunction) {
    try {
      const { reason } = req.body;
      const driver = await driverService.suspendDriver(req.params.id, reason);
      return res.status(200).json(driver);
    } catch (err) {
      return next(err);
    }
  },

  async reinstate(req: Request, res: Response, next: NextFunction) {
    try {
      const driver = await driverService.reinstateDriver(req.params.id);
      return res.status(200).json(driver);
    } catch (err) {
      return next(err);
    }
  },
};
