import express from 'express';
import auth from '../../middleware/auth';
import { PointControllers } from './points.controller';
import { upload } from '../../middleware/multer';

const router = express.Router();

router.post('/daily-claim', auth('member', 'admin', 'guest'), PointControllers.claimDaily);
router.post('/redeem', auth('member', 'admin', 'guest'), PointControllers.redeem);
router.post('/social-share', auth('member', 'admin', 'guest'), PointControllers.socialShare);
router.get(
  '/my-history', 
  auth('member', 'admin', 'guest'), 
  PointControllers.getMyHistory
);
router.get('/dashboard', auth('member', 'admin', 'guest'), PointControllers.getDashboard);
router.post('/claim-milestone', auth('member'), PointControllers.claimMilestone);
router.post(
  '/claim-profile-bonus', 
  auth('member', 'admin', 'guest'), 
  PointControllers.claimProfileBonus
);

router.post(
  '/apply-referral', 
  auth('member', 'admin', 'guest'), 
  PointControllers.applyReferral
);
router.get(
  '/referral-stats',
  auth('member', 'admin', 'superAdmin', 'guest'),
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
    auth('admin', 'superAdmin'), 
    PointControllers.getPendingSubmissions
);

router.patch(
    '/admin/review-proof/:id', 
    auth('admin', 'superAdmin'), 
    PointControllers.adminReview
);

router.patch(
    '/admin/update-user-points/:id',
    auth('admin', 'superAdmin'),
    PointControllers.adminUpdateUserPoints
);

router.get('/my-codes', auth('member', 'admin', 'guest'), PointControllers.getMyRedeemedCodes);
export const PointRoutes = router;