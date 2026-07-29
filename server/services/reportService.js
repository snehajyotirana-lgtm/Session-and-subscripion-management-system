import Client from '../models/Client.js';
import MonthlyReport from '../models/MonthlyReport.js';
import Payment from '../models/Payment.js';
import Session from '../models/Session.js';
import Subscription from '../models/Subscription.js';
import AppError from '../utils/AppError.js';
import { buildPaginationMeta, getPagination } from '../utils/query.js';

const getMonthRange = (month) => {
  const [year, monthValue] = month.split('-').map(Number);
  const periodStart = new Date(Date.UTC(year, monthValue - 1, 1, 0, 0, 0, 0));
  const periodEnd = new Date(Date.UTC(year, monthValue, 0, 23, 59, 59, 999));

  return { periodStart, periodEnd };
};

export const generateMonthlyReport = async (month, actorId) => {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
    throw new AppError('Month must be in YYYY-MM format.', 400);
  }

  const { periodStart, periodEnd } = getMonthRange(month);

  const [
    activeClients,
    newClients,
    activeSubscriptions,
    renewedSubscriptions,
    cancelledSubscriptions,
    totalSessions,
    completedSessions,
    cancelledSessions,
    payments,
  ] = await Promise.all([
    Client.countDocuments({ status: 'active' }),
    Client.countDocuments({ joinedAt: { $gte: periodStart, $lte: periodEnd } }),
    Subscription.countDocuments({
      status: 'active',
      startDate: { $lte: periodEnd },
      endDate: { $gte: periodStart },
    }),
    Subscription.countDocuments({
      'history.action': 'renewed',
      'history.actedAt': { $gte: periodStart, $lte: periodEnd },
    }),
    Subscription.countDocuments({
      'history.action': 'cancelled',
      'history.actedAt': { $gte: periodStart, $lte: periodEnd },
    }),
    Session.countDocuments({ scheduledAt: { $gte: periodStart, $lte: periodEnd } }),
    Session.countDocuments({
      scheduledAt: { $gte: periodStart, $lte: periodEnd },
      status: 'completed',
    }),
    Session.countDocuments({
      scheduledAt: { $gte: periodStart, $lte: periodEnd },
      status: 'cancelled',
    }),
    Payment.find({
      paymentDate: { $gte: periodStart, $lte: periodEnd },
      status: 'paid',
    }).select('amount'),
  ]);

  const reportPayload = {
    month,
    periodStart,
    periodEnd,
    totals: {
      clients: {
        active: activeClients,
        new: newClients,
      },
      subscriptions: {
        active: activeSubscriptions,
        renewed: renewedSubscriptions,
        cancelled: cancelledSubscriptions,
      },
      sessions: {
        total: totalSessions,
        completed: completedSessions,
        cancelled: cancelledSessions,
      },
      payments: {
        collected: payments.reduce((sum, payment) => sum + payment.amount, 0),
        transactions: payments.length,
      },
    },
    generatedBy: actorId,
  };

  const report = await MonthlyReport.findOneAndUpdate({ month }, reportPayload, {
    upsert: true,
    new: true,
    runValidators: true,
  }).populate({ path: 'generatedBy', select: 'name email role' });

  return report;
};

export const listMonthlyReports = async (query = {}) => {
  const { page, limit, skip } = getPagination(query);
  const filter = {};

  if (query.month) {
    filter.month = query.month;
  }

  const [items, total] = await Promise.all([
    MonthlyReport.find(filter)
      .populate({ path: 'generatedBy', select: 'name email role' })
      .sort({ month: -1 })
      .skip(skip)
      .limit(limit),
    MonthlyReport.countDocuments(filter),
  ]);

  return {
    items,
    meta: buildPaginationMeta({ total, page, limit }),
  };
};
