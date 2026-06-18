import express from 'express';
import auth from '../../middleware/auth';
import { upload } from '../../middleware/multer';
import validateRequest from '../../middleware/validateRequest';
import { PostControllers } from './post.controller';
import { PostValidations } from './post.validation';

const router = express.Router();

router.get('/:channelId/feed', auth('member', 'admin', 'guest'), PostControllers.getFeed);

router.post(
  '/create',
  auth('member'),
  upload.single('image'),
  (req, res, next) => {
    if (req.body.data) req.body = JSON.parse(req.body.data);
    next();
  },
  validateRequest(PostValidations.createPostSchema),
  PostControllers.createPost
);

router.patch('/:id/like', auth('member'), PostControllers.handleLike);
router.post('/comment', auth('member'), validateRequest(PostValidations.createCommentSchema), PostControllers.addComment);

export const PostRoutes = router;