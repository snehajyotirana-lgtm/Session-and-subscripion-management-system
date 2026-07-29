import Client from '../models/Client.js';
import Subscription from '../models/Subscription.js';
import AppError from '../utils/AppError.js';
import { buildPaginationMeta, getPagination } from '../utils/query.js';

const subscriptionPopulate = [
  { path: 'client', select: 'firstName lastName email phone status joinedAt' },
  { path: 'createdBy', select: 'name email role' },
  { path: 'history.actor', select: 'name email role' },
];

const ensureClientExists = async (clientId) => {
  const client = await Client.findById(clientId);

  if (!client) {
    throw new AppError('Client not found for subscription.', 404);
  }
};

export const listSubscriptions = async (query = {}) => {
  const { page, limit, skip } = getPagination(query);
  const filter = {};

  if (query.client) {
    filter.client = query.client;
  }

  if (query.status) {
    filter.status = query.status;
  }

  if (query.planType) {
    filter.planType = query.planType;
  }

  const [items, total] = await Promise.all([
    Subscription.find(filter)
      .populate(subscriptionPopulate)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Subscription.countDocuments(filter),
  ]);

  return {
    items,
    meta: buildPaginationMeta({ total, page, limit }),
  };
};

export const getSubscriptionById = async (subscriptionId) => {
  const subscription = await Subscription.findById(subscriptionId).populate(subscriptionPopulate);

  if (!subscription) {
    throw new AppError('Subscription not found.', 404);
  }

  return subscription;
};

export const createSubscription = async (payload, actorId) => {
  const normalizedPayload = {
    ...payload,
    planName: payload.planName || payload.plan || '',
    endDate: payload.endDate || payload.renewalDate,
  };

  if (normalizedPayload.client) {
    await ensureClientExists(normalizedPayload.client);
  }

  if (!normalizedPayload.endDate && normalizedPayload.startDate) {
    const start = new Date(normalizedPayload.startDate);
    start.setMonth(start.getMonth() + 1);
    normalizedPayload.endDate = start;
  }

  const history = [
    {
      action: 'created',
      notes: normalizedPayload.notes ?? 'Subscription created.',
      newEndDate: normalizedPayload.endDate,
      actor: actorId,
    },
  ];

  return Subscription.create({
    ...normalizedPayload,
    createdBy: actorId,
    history,
  });
};

export const updateSubscription = async (subscriptionId, payload, actorId) => {
  const normalizedPayload = {
    ...payload,
    planName: payload.planName || payload.plan || undefined,
    endDate: payload.endDate || payload.renewalDate,
  };

  if (normalizedPayload.client) {
    await ensureClientExists(normalizedPayload.client);
  }

  const subscription = await Subscription.findById(subscriptionId);

  if (!subscription) {
    throw new AppError('Subscription not found.', 404);
  }

  Object.assign(subscription, normalizedPayload);
  subscription.history.push({
    action: 'updated',
    notes: normalizedPayload.notes ?? 'Subscription updated.',
    newEndDate: subscription.endDate,
    actor: actorId,
  });

  await subscription.save();

  return getSubscriptionById(subscriptionId);
};

export const deleteSubscription = async (subscriptionId) => {
  const subscription = await Subscription.findByIdAndDelete(subscriptionId);

  if (!subscription) {
    throw new AppError('Subscription not found.', 404);
  }

  return subscription;
};

export const renewSubscription = async (
  subscriptionId,
  { extensionMonths = 1, newEndDate, notes },
  actorId,
) => {
  const subscription = await Subscription.findById(subscriptionId);

  if (!subscription) {
    throw new AppError('Subscription not found.', 404);
  }

  const previousEndDate = subscription.endDate;
  const baseDate = previousEndDate > new Date() ? new Date(previousEndDate) : new Date();
  const renewedEndDate = newEndDate
    ? new Date(newEndDate)
    : new Date(baseDate.setMonth(baseDate.getMonth() + Number(extensionMonths)));

  subscription.endDate = renewedEndDate;
  subscription.status = 'active';
  subscription.history.push({
    action: 'renewed',
    previousEndDate,
    newEndDate: renewedEndDate,
    notes: notes ?? `Subscription renewed by ${extensionMonths} month(s).`,
    actor: actorId,
  });

  await subscription.save();

  return getSubscriptionById(subscriptionId);
};

export const cancelSubscription = async (subscriptionId, { notes }, actorId) => {
  const subscription = await Subscription.findById(subscriptionId);

  if (!subscription) {
    throw new AppError('Subscription not found.', 404);
  }

  subscription.status = 'cancelled';
  subscription.history.push({
    action: 'cancelled',
    previousEndDate: subscription.endDate,
    newEndDate: subscription.endDate,
    notes: notes ?? 'Subscription cancelled.',
    actor: actorId,
  });

  await subscription.save();

  return getSubscriptionById(subscriptionId);
};

export const getSubscriptionHistory = async (subscriptionId) => {
  const subscription = await getSubscriptionById(subscriptionId);
  return subscription.history;
};
