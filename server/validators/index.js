import { body, param, query } from 'express-validator';

const objectIdParam = (field = 'id') =>
  param(field).isMongoId().withMessage(`${field} must be a valid MongoDB ObjectId.`);

const paginationValidators = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer.'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit must be between 1 and 100.'),
];

const optionalDateQuery = (field) =>
  query(field).optional().isISO8601().withMessage(`${field} must be a valid ISO date.`);

export const authValidators = {
  login: [
    body('email').isEmail().withMessage('A valid email is required.').normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long.'),
  ],
};

export const userValidators = {
  profile: [
    body('firstName').trim().notEmpty().withMessage('First name is required.'),
    body('lastName').trim().notEmpty().withMessage('Last name is required.'),
    body('email').optional().isEmail().withMessage('A valid email is required.').normalizeEmail(),
    body('phone').optional().trim().notEmpty().withMessage('Phone number cannot be empty.'),
    body('address').optional().trim(),
    body('profilePicture').optional().isURL().withMessage('Profile picture must be a valid URL.'),
  ],
  password: [
    body('currentPassword').trim().notEmpty().withMessage('Current password is required.'),
    body('newPassword')
      .trim()
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters long.'),
    body('confirmPassword')
      .trim()
      .custom((value, { req }) => value === req.body.newPassword)
      .withMessage('Confirm password must match new password.'),
  ],
};

export const clientValidators = {
  list: [
    ...paginationValidators,
    query('status').optional().isIn(['active', 'inactive']).withMessage('Invalid client status.'),
    query('assignedTrainer')
      .optional()
      .isMongoId()
      .withMessage('assignedTrainer must be a valid MongoDB ObjectId.'),
  ],
  create: [
    body('name').trim().notEmpty().withMessage('name is required.'),
    body('email').isEmail().withMessage('A valid email is required.').normalizeEmail(),
    body('phone').trim().notEmpty().withMessage('phone is required.'),
    body('company').optional().trim(),
    body('plan').optional().trim(),
    body('gender')
      .optional()
      .isIn(['male', 'female', 'other', 'prefer_not_to_say'])
      .withMessage('Invalid gender.'),
    body('dateOfBirth').optional().isISO8601().withMessage('dateOfBirth must be a valid date.'),
    body('status').optional().isIn(['active', 'inactive', 'lead']).withMessage('Invalid client status.'),
    body('goals').optional().isArray().withMessage('goals must be an array of strings.'),
    body('goals.*').optional().isString().withMessage('Each goal must be a string.'),
    body('assignedTrainer')
      .optional({ values: 'falsy' })
      .isMongoId()
      .withMessage('assignedTrainer must be a valid MongoDB ObjectId.'),
  ],
  update: [
    objectIdParam(),
    body('name').optional().trim().notEmpty().withMessage('name cannot be empty.'),
    body('email').optional().isEmail().withMessage('A valid email is required.').normalizeEmail(),
    body('phone').optional().trim().notEmpty().withMessage('phone cannot be empty.'),
    body('company').optional().trim(),
    body('plan').optional().trim(),
    body('gender')
      .optional()
      .isIn(['male', 'female', 'other', 'prefer_not_to_say'])
      .withMessage('Invalid gender.'),
    body('dateOfBirth').optional().isISO8601().withMessage('dateOfBirth must be a valid date.'),
    body('status').optional().isIn(['active', 'inactive', 'lead']).withMessage('Invalid client status.'),
    body('goals').optional().isArray().withMessage('goals must be an array of strings.'),
    body('goals.*').optional().isString().withMessage('Each goal must be a string.'),
    body('assignedTrainer')
      .optional({ values: 'falsy' })
      .isMongoId()
      .withMessage('assignedTrainer must be a valid MongoDB ObjectId.'),
  ],
  id: [objectIdParam()],
};

export const subscriptionValidators = {
  list: [
    ...paginationValidators,
    query('client').optional().isMongoId().withMessage('client must be a valid MongoDB ObjectId.'),
    query('status')
      .optional()
      .isIn(['active', 'cancelled', 'expired', 'pending'])
      .withMessage('Invalid subscription status.'),
    query('planType')
      .optional()
      .isIn(['monthly', 'quarterly', 'annual', 'custom'])
      .withMessage('Invalid planType.'),
  ],
  create: [
    body('client').optional().isMongoId().withMessage('client must be a valid MongoDB ObjectId.'),
    body('clientName').optional().trim().notEmpty().withMessage('clientName cannot be empty.'),
    body('planName').optional().trim().notEmpty().withMessage('planName is required.'),
    body('plan').optional().trim().notEmpty().withMessage('Plan is required.'),
    body('planType')
      .optional()
      .isIn(['monthly', 'quarterly', 'annual', 'custom'])
      .withMessage('Invalid planType.'),
    body('billingCycle')
      .optional()
      .isIn(['Monthly', 'Quarterly', 'Yearly', 'Custom', 'monthly', 'quarterly', 'yearly', 'custom'])
      .withMessage('Invalid billing cycle.'),
    body('status')
      .optional()
      .isIn(['active', 'cancelled', 'expired', 'pending'])
      .withMessage('Invalid subscription status.'),
    body('startDate').isISO8601().withMessage('startDate must be a valid date.'),
    body('renewalDate').optional().isISO8601().withMessage('renewalDate must be a valid date.'),
    body('endDate').optional().isISO8601().withMessage('endDate must be a valid date.'),
    body('amount').isFloat({ min: 0 }).withMessage('amount must be a non-negative number.'),
    body('sessionsIncluded')
      .optional()
      .isInt({ min: 0 })
      .withMessage('sessionsIncluded must be a non-negative integer.'),
    body('sessionsUsed')
      .optional()
      .isInt({ min: 0 })
      .withMessage('sessionsUsed must be a non-negative integer.'),
  ],
  update: [
    objectIdParam(),
    body('client').optional().isMongoId().withMessage('client must be a valid MongoDB ObjectId.'),
    body('clientName').optional().trim().notEmpty().withMessage('clientName cannot be empty.'),
    body('planName').optional().trim().notEmpty().withMessage('planName cannot be empty.'),
    body('plan').optional().trim().notEmpty().withMessage('Plan cannot be empty.'),
    body('planType')
      .optional()
      .isIn(['monthly', 'quarterly', 'annual', 'custom'])
      .withMessage('Invalid planType.'),
    body('billingCycle')
      .optional()
      .isIn(['Monthly', 'Quarterly', 'Yearly', 'Custom', 'monthly', 'quarterly', 'yearly', 'custom'])
      .withMessage('Invalid billing cycle.'),
    body('status')
      .optional()
      .isIn(['active', 'cancelled', 'expired', 'pending'])
      .withMessage('Invalid subscription status.'),
    body('startDate').optional().isISO8601().withMessage('startDate must be a valid date.'),
    body('renewalDate').optional().isISO8601().withMessage('renewalDate must be a valid date.'),
    body('endDate').optional().isISO8601().withMessage('endDate must be a valid date.'),
    body('amount')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('amount must be a non-negative number.'),
    body('sessionsIncluded')
      .optional()
      .isInt({ min: 0 })
      .withMessage('sessionsIncluded must be a non-negative integer.'),
    body('sessionsUsed')
      .optional()
      .isInt({ min: 0 })
      .withMessage('sessionsUsed must be a non-negative integer.'),
  ],
  renew: [
    objectIdParam(),
    body('extensionMonths')
      .optional()
      .isInt({ min: 1, max: 36 })
      .withMessage('extensionMonths must be between 1 and 36.'),
    body('newEndDate').optional().isISO8601().withMessage('newEndDate must be a valid date.'),
  ],
  cancel: [objectIdParam()],
  id: [objectIdParam()],
};

export const sessionValidators = {
  list: [
    ...paginationValidators,
    query('client').optional().isMongoId().withMessage('client must be a valid MongoDB ObjectId.'),
    query('trainer').optional().isMongoId().withMessage('trainer must be a valid MongoDB ObjectId.'),
    query('status')
      .optional()
      .isIn(['scheduled', 'completed', 'cancelled', 'no_show'])
      .withMessage('Invalid session status.'),
    optionalDateQuery('dateFrom'),
    optionalDateQuery('dateTo'),
  ],
  create: [
    body('client').optional().isMongoId().withMessage('client must be a valid MongoDB ObjectId.'),
    body('subscription')
      .optional({ values: 'falsy' })
      .isMongoId()
      .withMessage('subscription must be a valid MongoDB ObjectId.'),
    body('trainer').optional().trim().notEmpty().withMessage('trainer cannot be empty.'),
    body('trainerName').optional().trim().notEmpty().withMessage('trainerName cannot be empty.'),
    body('title').trim().notEmpty().withMessage('title is required.'),
    body('location').optional().trim(),
    body('sessionDate').isISO8601().withMessage('sessionDate must be a valid date.'),
    body('durationMinutes')
      .optional()
      .isInt({ min: 15 })
      .withMessage('durationMinutes must be at least 15 minutes.'),
    body('seats')
      .optional()
      .isInt({ min: 0 })
      .withMessage('seats must be a non-negative integer.'),
    body('attendance')
      .optional()
      .isInt({ min: 0 })
      .withMessage('attendance must be a non-negative integer.'),
    body('status')
      .optional()
      .isIn(['scheduled', 'completed', 'cancelled', 'no_show'])
      .withMessage('Invalid session status.'),
    body('sessionType')
      .optional()
      .isIn(['personal', 'group', 'assessment', 'follow_up', 'custom'])
      .withMessage('Invalid sessionType.'),
    body('scheduledAt').optional().isISO8601().withMessage('scheduledAt must be a valid date.'),
  ],
  update: [
    objectIdParam(),
    body('client').optional().isMongoId().withMessage('client must be a valid MongoDB ObjectId.'),
    body('subscription')
      .optional({ values: 'falsy' })
      .isMongoId()
      .withMessage('subscription must be a valid MongoDB ObjectId.'),
    body('trainer').optional().trim().notEmpty().withMessage('trainer cannot be empty.'),
    body('trainerName').optional().trim().notEmpty().withMessage('trainerName cannot be empty.'),
    body('title').optional().trim().notEmpty().withMessage('title cannot be empty.'),
    body('location').optional().trim(),
    body('sessionDate').optional().isISO8601().withMessage('sessionDate must be a valid date.'),
    body('durationMinutes')
      .optional()
      .isInt({ min: 15 })
      .withMessage('durationMinutes must be at least 15 minutes.'),
    body('seats')
      .optional()
      .isInt({ min: 0 })
      .withMessage('seats must be a non-negative integer.'),
    body('attendance')
      .optional()
      .isInt({ min: 0 })
      .withMessage('attendance must be a non-negative integer.'),
    body('status')
      .optional()
      .isIn(['scheduled', 'completed', 'cancelled', 'no_show'])
      .withMessage('Invalid session status.'),
    body('sessionType')
      .optional()
      .isIn(['personal', 'group', 'assessment', 'follow_up', 'custom'])
      .withMessage('Invalid sessionType.'),
    body('scheduledAt').optional().isISO8601().withMessage('scheduledAt must be a valid date.'),
  ],
  id: [objectIdParam()],
};

export const paymentValidators = {
  list: [
    ...paginationValidators,
    query('client').optional().isMongoId().withMessage('client must be a valid MongoDB ObjectId.'),
    query('subscription')
      .optional()
      .isMongoId()
      .withMessage('subscription must be a valid MongoDB ObjectId.'),
    query('status')
      .optional()
      .isIn(['pending', 'paid', 'failed', 'refunded'])
      .withMessage('Invalid payment status.'),
    query('method')
      .optional()
      .isIn(['cash', 'card', 'bank_transfer', 'online', 'other'])
      .withMessage('Invalid payment method.'),
    optionalDateQuery('dateFrom'),
    optionalDateQuery('dateTo'),
  ],
  create: [
    body('client').optional().isMongoId().withMessage('client must be a valid MongoDB ObjectId.'),
    body('clientName').optional().trim().notEmpty().withMessage('clientName cannot be empty.'),
    body('subscription')
      .optional({ values: 'falsy' })
      .isMongoId()
      .withMessage('subscription must be a valid MongoDB ObjectId.'),
    body('amount').isFloat({ min: 0 }).withMessage('amount must be a non-negative number.'),
    body('paidAt').optional().isISO8601().withMessage('paidAt must be a valid date.'),
    body('paymentDate').optional().isISO8601().withMessage('paymentDate must be a valid date.'),
    body('invoiceId').optional().trim(),
    body('method')
      .optional()
      .isIn(['cash', 'Card', 'Bank Transfer', 'bank_transfer', 'card', 'bank_transfer', 'online', 'other', 'UPI', 'upi'])
      .withMessage('Invalid payment method.'),
    body('status')
      .optional()
      .isIn(['pending', 'paid', 'failed', 'refunded'])
      .withMessage('Invalid payment status.'),
  ],
  update: [
    objectIdParam(),
    body('client').optional().isMongoId().withMessage('client must be a valid MongoDB ObjectId.'),
    body('clientName').optional().trim().notEmpty().withMessage('clientName cannot be empty.'),
    body('subscription')
      .optional({ values: 'falsy' })
      .isMongoId()
      .withMessage('subscription must be a valid MongoDB ObjectId.'),
    body('amount')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('amount must be a non-negative number.'),
    body('paidAt').optional().isISO8601().withMessage('paidAt must be a valid date.'),
    body('paymentDate').optional().isISO8601().withMessage('paymentDate must be a valid date.'),
    body('invoiceId').optional().trim(),
    body('method')
      .optional()
      .isIn(['cash', 'Card', 'Bank Transfer', 'bank_transfer', 'card', 'bank_transfer', 'online', 'other', 'UPI', 'upi'])
      .withMessage('Invalid payment method.'),
    body('status')
      .optional()
      .isIn(['pending', 'paid', 'failed', 'refunded'])
      .withMessage('Invalid payment status.'),
  ],
  addInstallment: [
    objectIdParam(),
    body('amount').isFloat({ min: 0 }).withMessage('amount must be a non-negative number.'),
    body('dueDate').isISO8601().withMessage('dueDate must be a valid date.'),
    body('paidDate').optional().isISO8601().withMessage('paidDate must be a valid date.'),
    body('status')
      .optional()
      .isIn(['pending', 'paid', 'overdue'])
      .withMessage('Invalid installment status.'),
  ],
  id: [objectIdParam()],
};

export const reportValidators = {
  generateMonthly: [
    body('month')
      .matches(/^\d{4}-(0[1-9]|1[0-2])$/)
      .withMessage('month must be in YYYY-MM format.'),
  ],
  listMonthly: [
    ...paginationValidators,
    query('month')
      .optional()
      .matches(/^\d{4}-(0[1-9]|1[0-2])$/)
      .withMessage('month must be in YYYY-MM format.'),
  ],
};
