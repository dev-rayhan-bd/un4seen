import express from 'express';
import auth from '../../middleware/auth';
import { PointControllers } from './points.controller';
import { upload } from '../../middleware/multer';

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
router.get(
  '/referral-stats',
  auth('member', 'admin', 'superAdmin'),
  PointControllers.getReferralStats
);
router.post(
    '/submit-proof', 
    auth('member', 'admin'), 
    upload.single('image'), 
    PointControllers.submitProof
);


router.get(
    '/admin/pending-proofs', 
    // auth('admin', 'superAdmin'), 
    PointControllers.getPendingSubmissions
);

router.patch(
    '/admin/review-proof/:id', 
    // auth('admin', 'superAdmin'), 
    PointControllers.adminReview
);
export const PointRoutes = router;