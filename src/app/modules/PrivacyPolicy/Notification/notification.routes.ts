import express from 'express';

import { NotificationControllers } from './notification.controller';
import { USER_ROLE } from '../../Auth/auth.constant';
import auth from '../../../middleware/auth';

const router = express.Router();


router.get(
  '/', 
  auth(USER_ROLE.superAdmin, USER_ROLE.admin,USER_ROLE.member), 
  NotificationControllers.getMyNotifications
);

 //(Mark All as Read)
router.patch(
  '/mark-all-read',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin,USER_ROLE.member),
  NotificationControllers.markAllAsRead
);


router.patch(
  '/mark-read/:id',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin,USER_ROLE.member),
  NotificationControllers.markSingleAsRead
);

// Test push notification - no auth required
router.post('/test-notification', NotificationControllers.testNotification);

export const NotificationRoutes = router;