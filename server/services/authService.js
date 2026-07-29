import AppError from '../utils/AppError.js';
import { signAccessToken } from '../utils/jwt.js';
import User from '../models/User.js';

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password.', 401);
  }

  if (!user.isActive) {
    throw new AppError('User account is inactive.', 403);
  }

  user.lastLoginAt = new Date();
  await user.save();

  const token = signAccessToken(user);
  const sanitizedUser = user.toObject();

  return { user: sanitizedUser, token };
};

export const getUserById = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  return user;
};
