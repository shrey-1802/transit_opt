import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export function validateBody(schema: ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      return next();
    } catch (err) {
      if (err instanceof ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.errors.forEach(e => {
          const path = e.path.join('.');
          fieldErrors[path] = e.message;
        });

        return res.status(400).json({
          code: 'VALIDATION_ERROR',
          message: 'One or more required fields failed validation constraints.',
          fieldErrors,
        });
      }
      return next(err);
    }
  };
}

export function validateQuery(schema: ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = await schema.parseAsync(req.query);
      return next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({
          code: 'INVALID_QUERY_PARAMS',
          message: 'Query parameter validation failed.',
          fieldErrors: err.flatten().fieldErrors,
        });
      }
      return next(err);
    }
  };
}
