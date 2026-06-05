import express from 'express';
import auth from '../../middleware/auth';
import { PointControllers } from './points.controller';

const router = express.Router();

router.post('/daily-claim', auth('member', 'admin'), PointControllers.claimDaily);
router.post('/redeem', auth('member', 'admin'), PointControllers.redeem);
router.post('/social-share', auth('member', 'admin'), PointControllers.socialShare);
router.get(
  '/my-history', 
  auth('member', 'admin'), 
  PointControllers.getMyHistory
);
router.get('/dashboard', auth('member', 'admin'), PointControllers.getDashboard);
router.post('/claim-milestone', auth('member'), PointControllers.claimMilestone);
router.post(
  '/claim-profile-bonus', 
  auth('member', 'admin'), 
  PointControllers.claimProfileBonus
);

router.post(
  '/apply-referral', 
  auth('member', 'admin'), 
  PointControllers.applyReferral
);
export const PointRoutes = router;