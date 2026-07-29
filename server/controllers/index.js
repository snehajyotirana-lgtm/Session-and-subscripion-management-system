import {
  createClient,
  deleteClient,
  getClientById,
  listClients,
  updateClient,
} from '../services/clientService.js';
import {
  addInstallment,
  createPayment,
  deletePayment,
  getPaymentById,
  listPayments,
  updatePayment,
} from '../services/paymentService.js';
import {
  generateMonthlyReport,
  listMonthlyReports,
} from '../services/reportService.js';
import {
  createSession,
  deleteSession,
  getSessionById,
  listSessions,
  updateSession,
} from '../services/sessionService.js';
import {
  cancelSubscription,
  createSubscription,
  deleteSubscription,
  getSubscriptionById,
  getSubscriptionHistory,
  listSubscriptions,
  renewSubscription,
  updateSubscription,
} from '../services/subscriptionService.js';
import { getDashboardOverview } from '../services/dashboardService.js';
import { getUserById, loginUser } from '../services/authService.js';
import {
  listUsers,
  updateUserProfile,
  changeUserPassword,
  updateUserProfilePicture,
} from '../services/userService.js';
import { sendSuccess } from '../utils/api.js';
import { attachAuthCookie, clearAuthCookie } from '../utils/jwt.js';

export const authController = {
  login: async (req, res) => {
    const { user, token } = await loginUser(req.body);
    attachAuthCookie(res, token);

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Login successful.',
      data: { user, token },
    });
  },
  logout: async (_req, res) => {
    clearAuthCookie(res);

    return sendSuccess(res, {
      message: 'Logout successful.',
    });
  },
  me: async (req, res) => {
    const user = await getUserById(req.user.id);

    return sendSuccess(res, {
      data: user,
      message: 'Authenticated user fetched successfully.',
    });
  },
};

export const userController = {
  list: async (_req, res) => {
    const users = await listUsers({})

    return sendSuccess(res, {
      message: 'Users fetched successfully.',
      data: users,
    })
  },

  getProfile: async (req, res) => {
    const user = await getUserById(req.user.id)

    return sendSuccess(res, {
      data: user,
      message: 'Profile fetched successfully.',
    })
  },

  updateProfile: async (req, res) => {
    const user = await updateUserProfile(req.user.id, req.body)

    return sendSuccess(res, {
      message: 'Profile updated successfully.',
      data: user,
    })
  },

  changePassword: async (req, res) => {
    await changeUserPassword(req.user.id, req.body)

    return sendSuccess(res, {
      message: 'Password changed successfully.',
    })
  },

  uploadProfilePicture: async (req, res) => {
    if (!req.file) {
      return sendSuccess(res, {
        statusCode: 400,
        message: 'Profile picture is required.',
      })
    }

    const profilePictureUrl = `${req.protocol}://${req.get('host')}/uploads/profile-pictures/${req.file.filename}`
    const user = await updateUserProfilePicture(req.user.id, profilePictureUrl)

    return sendSuccess(res, {
      message: 'Profile picture uploaded successfully.',
      data: user,
    })
  },
};

export const clientController = {
  list: async (req, res) => {
    const { items, meta } = await listClients(req.query);

    return sendSuccess(res, {
      message: 'Clients fetched successfully.',
      data: items,
      meta,
    });
  },
  create: async (req, res) =>
    sendSuccess(res, {
      statusCode: 201,
      message: 'Client created successfully.',
      data: await createClient(req.body),
    }),
  getById: async (req, res) =>
    sendSuccess(res, {
      message: 'Client fetched successfully.',
      data: await getClientById(req.params.id),
    }),
  update: async (req, res) =>
    sendSuccess(res, {
      message: 'Client updated successfully.',
      data: await updateClient(req.params.id, req.body),
    }),
  remove: async (req, res) =>
    sendSuccess(res, {
      message: 'Client deleted successfully.',
      data: await deleteClient(req.params.id),
    }),
};

export const subscriptionController = {
  list: async (req, res) => {
    const { items, meta } = await listSubscriptions(req.query);

    return sendSuccess(res, {
      message: 'Subscriptions fetched successfully.',
      data: items,
      meta,
    });
  },
  create: async (req, res) =>
    sendSuccess(res, {
      statusCode: 201,
      message: 'Subscription created successfully.',
      data: await createSubscription(req.body, req.user.id),
    }),
  getById: async (req, res) =>
    sendSuccess(res, {
      message: 'Subscription fetched successfully.',
      data: await getSubscriptionById(req.params.id),
    }),
  update: async (req, res) =>
    sendSuccess(res, {
      message: 'Subscription updated successfully.',
      data: await updateSubscription(req.params.id, req.body, req.user.id),
    }),
  remove: async (req, res) =>
    sendSuccess(res, {
      message: 'Subscription deleted successfully.',
      data: await deleteSubscription(req.params.id),
    }),
  renew: async (req, res) =>
    sendSuccess(res, {
      message: 'Subscription renewed successfully.',
      data: await renewSubscription(req.params.id, req.body, req.user.id),
    }),
  cancel: async (req, res) =>
    sendSuccess(res, {
      message: 'Subscription cancelled successfully.',
      data: await cancelSubscription(req.params.id, req.body, req.user.id),
    }),
  history: async (req, res) =>
    sendSuccess(res, {
      message: 'Subscription history fetched successfully.',
      data: await getSubscriptionHistory(req.params.id),
    }),
};

export const sessionController = {
  list: async (req, res) => {
    const { items, meta } = await listSessions(req.query);

    return sendSuccess(res, {
      message: 'Sessions fetched successfully.',
      data: items,
      meta,
    });
  },
  create: async (req, res) =>
    sendSuccess(res, {
      statusCode: 201,
      message: 'Session created successfully.',
      data: await createSession(req.body),
    }),
  getById: async (req, res) =>
    sendSuccess(res, {
      message: 'Session fetched successfully.',
      data: await getSessionById(req.params.id),
    }),
  update: async (req, res) =>
    sendSuccess(res, {
      message: 'Session updated successfully.',
      data: await updateSession(req.params.id, req.body),
    }),
  remove: async (req, res) =>
    sendSuccess(res, {
      message: 'Session deleted successfully.',
      data: await deleteSession(req.params.id),
    }),
};

export const paymentController = {
  list: async (req, res) => {
    const { items, meta } = await listPayments(req.query);

    return sendSuccess(res, {
      message: 'Payments fetched successfully.',
      data: items,
      meta,
    });
  },
  create: async (req, res) =>
    sendSuccess(res, {
      statusCode: 201,
      message: 'Payment created successfully.',
      data: await createPayment(req.body, req.user.id),
    }),
  getById: async (req, res) =>
    sendSuccess(res, {
      message: 'Payment fetched successfully.',
      data: await getPaymentById(req.params.id),
    }),
  update: async (req, res) =>
    sendSuccess(res, {
      message: 'Payment updated successfully.',
      data: await updatePayment(req.params.id, req.body),
    }),
  remove: async (req, res) =>
    sendSuccess(res, {
      message: 'Payment deleted successfully.',
      data: await deletePayment(req.params.id),
    }),
  addInstallment: async (req, res) =>
    sendSuccess(res, {
      message: 'Payment installment added successfully.',
      data: await addInstallment(req.params.id, req.body),
    }),
};

export const reportController = {
  generateMonthly: async (req, res) =>
    sendSuccess(res, {
      statusCode: 201,
      message: 'Monthly report generated successfully.',
      data: await generateMonthlyReport(req.body.month, req.user.id),
    }),
  listMonthly: async (req, res) => {
    const { items, meta } = await listMonthlyReports(req.query);

    return sendSuccess(res, {
      message: 'Monthly reports fetched successfully.',
      data: items,
      meta,
    });
  },
};

export const dashboardController = {
  overview: async (req, res) =>
    sendSuccess(res, {
      message: 'Dashboard overview fetched successfully.',
      data: await getDashboardOverview(),
    }),
};
