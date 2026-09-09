import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger.js';

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  logger.error(`Unhandled request error at [${req.method} ${req.url}]:`, err);

  const status = typeof err.status === 'number' ? err.status : 500;
  const code = err.code || (status === 404 ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR');
  const message = status === 500 && process.env.NODE_ENV === 'production'
    ? 'An unexpected operational error occurred on the server.'
    : err.message || 'Internal Server Error';

  return res.status(status).json({
    code,
    message,
    fieldErrors: err.fieldErrors,
    correlationId: req.correlationId,
  });
}
