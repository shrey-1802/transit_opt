import { Request, Response, NextFunction } from 'express';
import { dispatchService } from '../services/dispatchService.js';

export const tripController = {
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const trips = await dispatchService.getTrips();
      return res.status(200).json(trips);
    } catch (err) {
      return next(err);
    }
  },

  async validateDispatch(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await dispatchService.validateDispatch(req.body);
      return res.status(200).json(result);
    } catch (err) {
      return next(err);
    }
  },

  async dispatch(req: Request, res: Response, next: NextFunction) {
    try {
      const trip = await dispatchService.dispatchTrip(req.body);
      return res.status(201).json(trip);
    } catch (err) {
      return next(err);
    }
  },

  async complete(req: Request, res: Response, next: NextFunction) {
    try {
      const trip = await dispatchService.completeTrip(req.params.id, req.body);
      return res.status(200).json(trip);
    } catch (err) {
      return next(err);
    }
  },

  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const { reason } = req.body;
      const trip = await dispatchService.cancelTrip(req.params.id, reason);
      return res.status(200).json(trip);
    } catch (err) {
      return next(err);
    }
  },
};
