import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import { getTokenFromRequest, verifyAccessToken } from '../utils/jwt.js';

export const authenticate = async (req, _res, next) => {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      throw new AppError('Authentication required.', 401);
    }

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.sub);

    if (!user || !user.isActive) {
      throw new AppError('Invalid authentication session.', 401);
    }

    req.user = user.toObject();
    return next();
  } catch (error) {
    return next(error);
  }
};

export const authorize = (...roles) => (req, _res, next) => {
  if (!req.user) {
    return next(new AppError('Authentication required.', 401));
  }

  if (!roles.includes(req.user.role)) {
    return next(new AppError('You do not have permission to perform this action.', 403));
  }

  return next();
};
