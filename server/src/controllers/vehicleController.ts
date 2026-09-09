import { Request, Response, NextFunction } from 'express';
import { vehicleService } from '../services/vehicleService.js';

export const vehicleController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { type, status, region } = req.query as { type?: string; status?: string; region?: string };
      const vehicles = await vehicleService.getVehicles({ type, status, region });
      return res.status(200).json(vehicles);
    } catch (err) {
      return next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const vehicle = await vehicleService.getVehicleById(req.params.id);
      return res.status(200).json(vehicle);
    } catch (err) {
      return next(err);
    }
  },

  async getDigitalTwin(req: Request, res: Response, next: NextFunction) {
    try {
      const twin = await vehicleService.getDigitalTwin(req.params.id);
      return res.status(200).json(twin);
    } catch (err) {
      return next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const vehicle = await vehicleService.createVehicle(req.body);
      return res.status(201).json(vehicle);
    } catch (err) {
      return next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const vehicle = await vehicleService.updateVehicle(req.params.id, req.body);
      return res.status(200).json(vehicle);
    } catch (err) {
      return next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await vehicleService.deleteVehicle(req.params.id);
      return res.status(200).json({ message: 'Vehicle decommissioned and removed successfully.' });
    } catch (err) {
      return next(err);
    }
  },

  async addDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const doc = await vehicleService.addDocument(req.params.id, req.body);
      return res.status(201).json(doc);
    } catch (err) {
      return next(err);
    }
  },
};
