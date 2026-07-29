import mongoose from 'mongoose';
import Client from '../models/Client.js';
import Session from '../models/Session.js';
import Subscription from '../models/Subscription.js';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import { buildDateRangeFilter, buildPaginationMeta, getPagination } from '../utils/query.js';

const sessionPopulate = [
  { path: 'client', select: 'firstName lastName email phone status' },
  { path: 'subscription', select: 'planName status startDate endDate sessionsIncluded sessionsUsed' },
  { path: 'trainer', select: 'name email role' },
];

const normalizeSessionPayload = (payload) => {
  const normalized = {
    ...payload,
    scheduledAt: payload.scheduledAt || payload.sessionDate,
  };

  if (payload.trainer && !mongoose.Types.ObjectId.isValid(payload.trainer)) {
    normalized.trainerName = payload.trainer;
    delete normalized.trainer;
  }

  return normalized;
};

const ensureDependencies = async ({ client, subscription, trainer }) => {
  const checks = [];

  if (client) {
    checks.push(
      Client.findById(client).then((doc) => {
        if (!doc) {
          throw new AppError('Client not found for session.', 404);
        }
      }),
    );
  }

  if (subscription) {
    checks.push(
      Subscription.findById(subscription).then((doc) => {
        if (!doc) {
          throw new AppError('Subscription not found for session.', 404);
        }
      }),
    );
  }

  if (trainer && mongoose.Types.ObjectId.isValid(trainer)) {
    checks.push(
      User.findOne({ _id: trainer, role: 'trainer' }).then((doc) => {
        if (!doc) {
          throw new AppError('Trainer not found for session.', 404);
        }
      }),
    );
  }

  await Promise.all(checks);
};

const syncSubscriptionUsage = async (subscriptionId) => {
  if (!subscriptionId) {
    return;
  }

  const completedSessions = await Session.countDocuments({
    subscription: subscriptionId,
    status: 'completed',
  });

  await Subscription.findByIdAndUpdate(subscriptionId, {
    sessionsUsed: completedSessions,
  });
};

export const listSessions = async (query = {}) => {
  const { page, limit, skip } = getPagination(query);
  const filter = {
    ...buildDateRangeFilter('scheduledAt', query.dateFrom, query.dateTo),
  };

  if (query.client) {
    filter.client = query.client;
  }

  if (query.trainer) {
    filter.trainer = query.trainer;
  }

  if (query.status) {
    filter.status = query.status;
  }

  const [items, total] = await Promise.all([
    Session.find(filter)
      .populate(sessionPopulate)
      .sort({ scheduledAt: 1 })
      .skip(skip)
      .limit(limit),
    Session.countDocuments(filter),
  ]);

  return {
    items,
    meta: buildPaginationMeta({ total, page, limit }),
  };
};

export const getSessionById = async (sessionId) => {
  const session = await Session.findById(sessionId).populate(sessionPopulate);

  if (!session) {
    throw new AppError('Session not found.', 404);
  }

  return session;
};

export const createSession = async (payload) => {
  const normalizedPayload = normalizeSessionPayload(payload);
  await ensureDependencies(normalizedPayload);

  const session = await Session.create(normalizedPayload);

  await syncSubscriptionUsage(session.subscription);

  return getSessionById(session._id);
};

export const updateSession = async (sessionId, payload) => {
  const normalizedPayload = normalizeSessionPayload(payload);
  await ensureDependencies(normalizedPayload);

  const existingSession = await Session.findById(sessionId);

  if (!existingSession) {
    throw new AppError('Session not found.', 404);
  }

  const previousSubscription = existingSession.subscription?.toString();

  Object.assign(existingSession, normalizedPayload);
  await existingSession.save();

  await Promise.all([
    syncSubscriptionUsage(previousSubscription),
    syncSubscriptionUsage(existingSession.subscription),
  ]);

  return getSessionById(sessionId);
};

export const deleteSession = async (sessionId) => {
  const session = await Session.findByIdAndDelete(sessionId);

  if (!session) {
    throw new AppError('Session not found.', 404);
  }

  await syncSubscriptionUsage(session.subscription);

  return session;
};
