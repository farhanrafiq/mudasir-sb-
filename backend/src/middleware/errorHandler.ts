import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Standardized error response
  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected error occurred.';
  // Log full error for debugging
  if (statusCode === 500) {
    console.error('Unexpected error:', err);
  }
  res.status(statusCode).json({
    message,
    errors: err.errors || undefined,
  });
};

export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({
    message: `Route ${req.originalUrl} not found`,
  });
};
