import { validationResult } from 'express-validator';

import AppError from '../utils/AppError.js';

const validateRequest = (req, _res, next) => {
  const result = validationResult(req);

  if (result.isEmpty()) {
    return next();
  }

  return next(
    new AppError(
      'Request validation failed.',
      400,
      result.array().map((issue) => ({
        field: issue.path,
        message: issue.msg,
      })),
    ),
  );
};

export default validateRequest;
