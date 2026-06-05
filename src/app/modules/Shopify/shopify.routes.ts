import express from 'express';
import { ShopifyControllers } from './shopify.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../Auth/auth.constant';

const router = express.Router();


router.post(
  '/generate-token',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin), 
  ShopifyControllers.generateAdminToken
);

export const ShopifyRoutes = router;