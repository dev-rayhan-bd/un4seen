import express from 'express';
import auth from '../../middleware/auth';
import { upload } from '../../middleware/multer';
import { MilestoneControllers } from './milestone.controller';

const router = express.Router();

router.get('/', auth('member', 'admin', 'superAdmin'), MilestoneControllers.getAllMilestones);

router.post(
  '/create',
  auth('admin', 'superAdmin'),
  upload.single('image'),
  MilestoneControllers.createMilestone
);

router.patch(
  '/:id',
  auth('admin', 'superAdmin'),
  upload.single('image'),
  MilestoneControllers.updateMilestone
);

router.delete('/:id', auth('admin', 'superAdmin'), MilestoneControllers.deleteMilestone);

export const MilestoneRoutes = router;