import { Request, Response, NextFunction } from 'express';

export type UserRole = 'fleet_manager' | 'dispatcher' | 'safety_officer' | 'financial_analyst';

export function requireRoles(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        code: 'UNAUTHORIZED',
        message: 'Authentication required before accessing this protected resource.',
      });
    }

    const userRole = req.user.role as UserRole;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        code: 'FORBIDDEN',
        message: `Role '${userRole}' is not authorized to perform this operation. Allowed roles: ${allowedRoles.join(', ')}.`,
      });
    }

    return next();
  };
}
