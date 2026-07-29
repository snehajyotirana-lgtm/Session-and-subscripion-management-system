import bcrypt from 'bcryptjs';

import AppError from '../utils/AppError.js';
import User from '../models/User.js';

export const listUsers = async () => User.find().select('-password');

export const updateUserProfile = async (userId, payload) => {
  const user = await User.findById(userId).select('+password');

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  if (payload.email && payload.email !== user.email) {
    const existing = await User.findOne({ email: payload.email.toLowerCase() });
    if (existing && existing.id !== user.id) {
      throw new AppError('Email is already in use by another account.', 409);
    }
    user.email = payload.email.toLowerCase();
  }

  if (payload.firstName !== undefined) {
    user.firstName = payload.firstName;
  }
  if (payload.lastName !== undefined) {
    user.lastName = payload.lastName;
  }
  if (payload.phone !== undefined) {
    user.phone = payload.phone;
  }
  if (payload.address !== undefined) {
    user.address = payload.address;
  }
  if (payload.profilePicture !== undefined) {
    user.profilePicture = payload.profilePicture;
  }

  await user.save();

  return User.findById(userId);
};

export const changeUserPassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId).select('+password');

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  if (!(await user.comparePassword(currentPassword))) {
    throw new AppError('Current password is incorrect.', 400);
  }

  user.password = newPassword;
  await user.save();
};

export const updateUserProfilePicture = async (userId, profilePictureUrl) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  user.profilePicture = profilePictureUrl;
  await user.save();

  return user;
};
