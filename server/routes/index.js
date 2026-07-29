import { Router } from 'express';

import {
  authController,
  clientController,
  dashboardController,
  paymentController,
  reportController,
  sessionController,
  subscriptionController,
  userController,
} from '../controllers/index.js';
import { authenticate, authorize } from '../middleware/auth.js';
import validateRequest from '../middleware/validateRequest.js';
import asyncHandler from '../utils/asyncHandler.js';
import { uploadProfilePicture } from '../middleware/upload.js';
import {
  authValidators,
  clientValidators,
  paymentValidators,
  reportValidators,
  sessionValidators,
  subscriptionValidators,
  userValidators,
} from '../validators/index.js';

const router = Router();

const authRouter = Router();
authRouter.post('/login', authValidators.login, validateRequest, asyncHandler(authController.login));
authRouter.post('/logout', authenticate, asyncHandler(authController.logout));
authRouter.get('/me', authenticate, asyncHandler(authController.me));

const clientRouter = Router();
clientRouter.use(authenticate);
clientRouter
  .route('/')
  .get(clientValidators.list, validateRequest, asyncHandler(clientController.list))
  .post(
    authorize('admin', 'trainer'),
    clientValidators.create,
    validateRequest,
    asyncHandler(clientController.create),
  );
clientRouter
  .route('/:id')
  .get(clientValidators.id, validateRequest, asyncHandler(clientController.getById))
  .put(
    authorize('admin', 'trainer'),
    clientValidators.update,
    validateRequest,
    asyncHandler(clientController.update),
  )
  .delete(
    authorize('admin'),
    clientValidators.id,
    validateRequest,
    asyncHandler(clientController.remove),
  );

const subscriptionRouter = Router();
subscriptionRouter.use(authenticate);
subscriptionRouter
  .route('/')
  .get(subscriptionValidators.list, validateRequest, asyncHandler(subscriptionController.list))
  .post(
    authorize('admin', 'trainer'),
    subscriptionValidators.create,
    validateRequest,
    asyncHandler(subscriptionController.create),
  );
subscriptionRouter.get(
  '/:id/history',
  subscriptionValidators.id,
  validateRequest,
  asyncHandler(subscriptionController.history),
);
subscriptionRouter.patch(
  '/:id/renew',
  authorize('admin', 'trainer'),
  subscriptionValidators.renew,
  validateRequest,
  asyncHandler(subscriptionController.renew),
);
subscriptionRouter.patch(
  '/:id/cancel',
  authorize('admin', 'trainer'),
  subscriptionValidators.cancel,
  validateRequest,
  asyncHandler(subscriptionController.cancel),
);
subscriptionRouter
  .route('/:id')
  .get(subscriptionValidators.id, validateRequest, asyncHandler(subscriptionController.getById))
  .put(
    authorize('admin', 'trainer'),
    subscriptionValidators.update,
    validateRequest,
    asyncHandler(subscriptionController.update),
  )
  .delete(
    authorize('admin'),
    subscriptionValidators.id,
    validateRequest,
    asyncHandler(subscriptionController.remove),
  );

const sessionRouter = Router();
sessionRouter.use(authenticate);
sessionRouter
  .route('/')
  .get(sessionValidators.list, validateRequest, asyncHandler(sessionController.list))
  .post(
    authorize('admin', 'trainer'),
    sessionValidators.create,
    validateRequest,
    asyncHandler(sessionController.create),
  );
sessionRouter
  .route('/:id')
  .get(sessionValidators.id, validateRequest, asyncHandler(sessionController.getById))
  .put(
    authorize('admin', 'trainer'),
    sessionValidators.update,
    validateRequest,
    asyncHandler(sessionController.update),
  )
  .delete(
    authorize('admin'),
    sessionValidators.id,
    validateRequest,
    asyncHandler(sessionController.remove),
  );

const paymentRouter = Router();
paymentRouter.use(authenticate);
paymentRouter
  .route('/')
  .get(paymentValidators.list, validateRequest, asyncHandler(paymentController.list))
  .post(
    authorize('admin', 'trainer'),
    paymentValidators.create,
    validateRequest,
    asyncHandler(paymentController.create),
  );
paymentRouter.post(
  '/:id/installments',
  authorize('admin', 'trainer'),
  paymentValidators.addInstallment,
  validateRequest,
  asyncHandler(paymentController.addInstallment),
);
paymentRouter
  .route('/:id')
  .get(paymentValidators.id, validateRequest, asyncHandler(paymentController.getById))
  .put(
    authorize('admin', 'trainer'),
    paymentValidators.update,
    validateRequest,
    asyncHandler(paymentController.update),
  )
  .delete(
    authorize('admin'),
    paymentValidators.id,
    validateRequest,
    asyncHandler(paymentController.remove),
  );

const reportRouter = Router();
reportRouter.use(authenticate);
reportRouter.get(
  '/monthly',
  authorize('admin', 'trainer'),
  reportValidators.listMonthly,
  validateRequest,
  asyncHandler(reportController.listMonthly),
);
reportRouter.post(
  '/monthly/generate',
  authorize('admin'),
  reportValidators.generateMonthly,
  validateRequest,
  asyncHandler(reportController.generateMonthly),
);

const dashboardRouter = Router();
dashboardRouter.use(authenticate);
dashboardRouter.get(
  '/overview',
  authorize('admin', 'trainer'),
  asyncHandler(dashboardController.overview),
);

const userRouter = Router();
userRouter.use(authenticate);
userRouter.get('/', authorize('admin', 'trainer'), validateRequest, asyncHandler(userController.list));
userRouter.get('/profile', asyncHandler(userController.getProfile));
userRouter.put('/profile', userValidators.profile, validateRequest, asyncHandler(userController.updateProfile));
userRouter.put('/change-password', userValidators.password, validateRequest, asyncHandler(userController.changePassword));
userRouter.post(
  '/profile-picture',
  uploadProfilePicture.single('profilePicture'),
  asyncHandler(userController.uploadProfilePicture),
);

router.use('/auth', authRouter);
router.use('/clients', clientRouter);
router.use('/subscriptions', subscriptionRouter);
router.use('/sessions', sessionRouter);
router.use('/payments', paymentRouter);
router.use('/reports', reportRouter);
router.use('/dashboard', dashboardRouter);
router.use('/users', userRouter);

export default router;
