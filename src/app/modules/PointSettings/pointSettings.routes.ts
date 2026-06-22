import express from 'express';
import auth from '../../middleware/auth';
import { PointControllers } from '../ShredPoints/points.controller';
import { PointSettingsControllers } from './pointSettings.controller';


const router = express.Router();

router.get(
  '/settings', 
  auth('admin', 'superAdmin'), 
  PointControllers.getDashboard 
);

router.get(
  '/admin/settings', 
  auth('admin', 'superAdmin'), 
  PointSettingsControllers.getSettings
);

router.patch(
  '/admin/update-settings', 
  auth('admin', 'superAdmin'), 
  PointSettingsControllers.updateSettings
);
export const PointSettingRoutes = router;