import Client from '../models/Client.js';
import Payment from '../models/Payment.js';
import Session from '../models/Session.js';
import Subscription from '../models/Subscription.js';

export const getDashboardOverview = async () => {
  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

  const [
    totalClients,
    activeClients,
    activeSubscriptions,
    upcomingSessions,
    recentSessions,
    recentPayments,
    paidPayments,
  ] = await Promise.all([
    Client.countDocuments(),
    Client.countDocuments({ status: 'active' }),
    Subscription.countDocuments({
      status: 'active',
      endDate: { $gte: today },
    }),
    Session.countDocuments({
      status: 'scheduled',
      scheduledAt: { $gte: today },
    }),
    Session.find()
      .populate([
        { path: 'client', select: 'firstName lastName' },
        { path: 'trainer', select: 'name email' },
      ])
      .sort({ scheduledAt: -1 })
      .limit(5),
    Payment.find()
      .populate([
        { path: 'client', select: 'firstName lastName' },
        { path: 'subscription', select: 'planName' },
      ])
      .sort({ paymentDate: -1 })
      .limit(5),
    Payment.find({
      paymentDate: { $gte: monthStart, $lte: monthEnd },
      status: 'paid',
    }).select('amount'),
  ]);

  return {
    metrics: {
      totalClients,
      activeClients,
      activeSubscriptions,
      upcomingSessions,
      revenueThisMonth: paidPayments.reduce((sum, payment) => sum + payment.amount, 0),
    },
    recentSessions,
    recentPayments,
  };
};
