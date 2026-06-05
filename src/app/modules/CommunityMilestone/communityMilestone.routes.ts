import express, { NextFunction,Request,Response } from 'express';
import auth from '../../middleware/auth';
import { upload } from '../../middleware/multer';
import { CommunityMilestoneControllers } from './communityMilestone.controller';
import { USER_ROLE } from '../Auth/auth.constant';

const router = express.Router();

router.get('/', auth(USER_ROLE.member, USER_ROLE.admin), CommunityMilestoneControllers.getAllMilestones);

router.post(
  '/create',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  upload.single('image'),
  (req: Request, res: Response, next: NextFunction) => {

    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }
    next();
  },

  // validateRequest(CommunityMilestoneValidations.createMilestoneSchema), 
  CommunityMilestoneControllers.createMilestone
);

router.post(
  '/claim/:id', 
  auth(USER_ROLE.member, USER_ROLE.admin), 
  CommunityMilestoneControllers.claimMilestone
);
router.patch(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  upload.single('image'),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }
    next();
  },
  CommunityMilestoneControllers.updateMilestone
);

router.delete('/:id', auth(USER_ROLE.admin, USER_ROLE.superAdmin), CommunityMilestoneControllers.deleteMilestone);

export const CommunityMilestoneRoutes = router;