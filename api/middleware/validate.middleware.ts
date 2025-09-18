import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import { z, ZodSchema } from 'zod';
import ApiError from '../utils/AppError';

export const validate =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors
          .map((e) => `${e.path.join('.')}: ${e.message}`)
          .join(', ');
        return next(new ApiError(httpStatus.BAD_REQUEST, errorMessage));
      }
      next(error);
    }
  };