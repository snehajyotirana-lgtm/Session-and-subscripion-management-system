import mongoose from 'mongoose';

import AppError from '../utils/AppError.js';

export const notFoundHandler = (req, _res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};

export const errorHandler = (error, _req, res, _next) => {
  let normalizedError = error;

  if (error instanceof mongoose.Error.ValidationError) {
    normalizedError = new AppError(
      'Validation failed.',
      400,
      Object.values(error.errors).map((issue) => issue.message),
    );
  }

  if (error instanceof mongoose.Error.CastError) {
    normalizedError = new AppError(`Invalid ${error.path}: ${error.value}`, 400);
  }

  if (error?.code === 11000) {
    const duplicateField = Object.keys(error.keyPattern ?? {})[0] ?? 'field';
    normalizedError = new AppError(`Duplicate value for ${duplicateField}.`, 409);
  }

  if (error?.name === 'JsonWebTokenError') {
    normalizedError = new AppError('Invalid authentication token.', 401);
  }

  if (error?.name === 'TokenExpiredError') {
    normalizedError = new AppError('Authentication token has expired.', 401);
  }

  const statusCode = normalizedError.statusCode ?? 500;
  const message = normalizedError.message ?? 'Internal server error.';

  return res.status(statusCode).json({
    success: false,
    message,
    details: normalizedError.details ?? null,
    stack:
      process.env.NODE_ENV === 'production' || normalizedError instanceof AppError
        ? undefined
        : normalizedError.stack,
  });
};
