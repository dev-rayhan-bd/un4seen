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
router.get(
  '/store-feed', 
  auth('member', 'admin', 'guest'), 
  ShopifyControllers.getStoreProducts
);


router.get('/all-products', auth('admin', 'superAdmin'), ShopifyControllers.getAllProducts);


router.post('/select-products', auth('admin', 'superAdmin'), ShopifyControllers.selectProducts);

router.post('/toggle-selection', auth('admin', 'superAdmin'), ShopifyControllers.toggleProduct);
router.get('/app-store', ShopifyControllers.getAppStoreFeed);
export const ShopifyRoutes = router;