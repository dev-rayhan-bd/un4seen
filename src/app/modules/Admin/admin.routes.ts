import express from 'express';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../Auth/auth.constant';
import { AdminControllers } from './admin.controller';

const router = express.Router();


router.get(
  '/dashboard-stats',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  AdminControllers.getDashboardStats
);

export const AdminRoutes = router;