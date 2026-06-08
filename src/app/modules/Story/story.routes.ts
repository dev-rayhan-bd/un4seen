import express, { NextFunction, Request, Response } from 'express';
import auth from '../../middleware/auth';
import { upload } from '../../middleware/multer';
import validateRequest from '../../middleware/validateRequest';
import { StoryControllers } from './story.controller';
import { StoryValidations } from './story.validation';
import { USER_ROLE } from '../Auth/auth.constant';

const router = express.Router();

router.post(
  '/create',
  auth(USER_ROLE.member, USER_ROLE.admin),
  upload.single('content'), 
  (req: Request, res: Response, next: NextFunction) => {
  
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }
    next();
  },
  validateRequest(StoryValidations.createStorySchema),
  StoryControllers.createStory
);

router.get('/', auth('member', 'admin', 'guest'), StoryControllers.getStories);
router.patch('/:id/heart', auth('member', 'admin'), StoryControllers.toggleHeart);

export const StoryRoutes = router;