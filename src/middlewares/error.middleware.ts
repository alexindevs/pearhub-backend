// src/middlewares/error.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/api-error';
import { ZodError } from 'zod';


function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error(err);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: err.message,
      details: err.details,
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      errors: err.errors.map(e => ({
        code: e.code,
        message: e.message,
        path: e.path,
      })),
    });
  }

  return res.status(500).json({
    error: 'Internal Server Error',
  });
}

interface ErrorHandler {
  (err: unknown, req: Request, res: Response, next: NextFunction): void;
}

export const errorHandlerMiddleware: ErrorHandler = (err, req, res, next) => errorHandler(err, req, res, next);