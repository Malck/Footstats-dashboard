// src/middlewares/errorHandler.ts
import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error:   err.name,
      message: err.message,
    });
    return;
  }

  console.error('[Server Error]', err);
  res.status(500).json({
    error:   'InternalServerError',
    message: 'Something went wrong. Please try again later.',
  });
};
