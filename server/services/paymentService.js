import Client from '../models/Client.js';
import Payment from '../models/Payment.js';
import Subscription from '../models/Subscription.js';
import AppError from '../utils/AppError.js';
import { buildDateRangeFilter, buildPaginationMeta, getPagination } from '../utils/query.js';

const paymentPopulate = [
  { path: 'client', select: 'firstName lastName email phone' },
  { path: 'subscription', select: 'planName status endDate' },
  { path: 'createdBy', select: 'name email role' },
];

const ensureDependencies = async ({ client, subscription }) => {
  const checks = [];

  if (client) {
    checks.push(
      Client.findById(client).then((doc) => {
        if (!doc) {
          throw new AppError('Client not found for payment.', 404);
        }
      }),
    );
  }

  if (subscription) {
    checks.push(
      Subscription.findById(subscription).then((doc) => {
        if (!doc) {
          throw new AppError('Subscription not found for payment.', 404);
        }
      }),
    );
  }

  await Promise.all(checks);
};

export const listPayments = async (query = {}) => {
  const { page, limit, skip } = getPagination(query);
  const filter = {
    ...buildDateRangeFilter('paymentDate', query.dateFrom, query.dateTo),
  };

  if (query.client) {
    filter.client = query.client;
  }

  if (query.subscription) {
    filter.subscription = query.subscription;
  }

  if (query.status) {
    filter.status = query.status;
  }

  if (query.method) {
    filter.method = query.method;
  }

  const [items, total] = await Promise.all([
    Payment.find(filter)
      .populate(paymentPopulate)
      .sort({ paymentDate: -1 })
      .skip(skip)
      .limit(limit),
    Payment.countDocuments(filter),
  ]);

  return {
    items,
    meta: buildPaginationMeta({ total, page, limit }),
  };
};

export const getPaymentById = async (paymentId) => {
  const payment = await Payment.findById(paymentId).populate(paymentPopulate);

  if (!payment) {
    throw new AppError('Payment not found.', 404);
  }

  return payment;
};

const normalizePaymentPayload = (payload) => {
  const methodMap = {
    Cash: 'cash',
    cash: 'cash',
    Card: 'card',
    card: 'card',
    'Bank Transfer': 'bank_transfer',
    bank_transfer: 'bank_transfer',
    online: 'online',
    Other: 'other',
    other: 'other',
    UPI: 'upi',
    upi: 'upi',
  };

  return {
    ...payload,
    paymentDate: payload.paymentDate || payload.paidAt || payload.date || undefined,
    method: methodMap[payload.method] ?? payload.method,
  };
};

export const createPayment = async (payload, actorId) => {
  const normalizedPayload = normalizePaymentPayload(payload);

  await ensureDependencies(normalizedPayload);

  const payment = await Payment.create({
    ...normalizedPayload,
    createdBy: actorId,
  });

  return getPaymentById(payment._id);
};

export const updatePayment = async (paymentId, payload) => {
  const normalizedPayload = normalizePaymentPayload(payload);
  await ensureDependencies(normalizedPayload);

  const payment = await Payment.findByIdAndUpdate(paymentId, normalizedPayload, {
    new: true,
    runValidators: true,
  }).populate(paymentPopulate);

  if (!payment) {
    throw new AppError('Payment not found.', 404);
  }

  return payment;
};

export const deletePayment = async (paymentId) => {
  const payment = await Payment.findByIdAndDelete(paymentId);

  if (!payment) {
    throw new AppError('Payment not found.', 404);
  }

  return payment;
};

export const addInstallment = async (paymentId, installmentPayload) => {
  const payment = await Payment.findById(paymentId);

  if (!payment) {
    throw new AppError('Payment not found.', 404);
  }

  payment.installments.push(installmentPayload);
  await payment.save();

  return getPaymentById(paymentId);
};
