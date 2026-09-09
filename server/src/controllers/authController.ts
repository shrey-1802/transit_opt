import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService.js';

export const authController = {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      return res.status(200).json(result);
    } catch (err) {
      return next(err);
    }
  },

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Not authenticated.' });
      }
      const user = await authService.getCurrentUser(req.user.userId);
      return res.status(200).json(user);
    } catch (err) {
      return next(err);
    }
  },

  async logout(_req: Request, res: Response) {
    return res.status(200).json({ message: 'Logged out successfully.' });
  },
};
