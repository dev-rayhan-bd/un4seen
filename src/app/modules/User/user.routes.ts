import express, { NextFunction, Request, Response } from 'express';

import { USER_ROLE } from '../Auth/auth.constant';
import { upload } from '../../middleware/multer';
import auth from '../../middleware/auth';
import { UserControllers } from './user.controller';

const router = express.Router();

router.get('/my-profile', auth(USER_ROLE.member, USER_ROLE.superAdmin, USER_ROLE.admin),UserControllers.getMyProfile);
router.patch(
  '/update-profile',
  auth(USER_ROLE.member, USER_ROLE.admin, USER_ROLE.superAdmin),
  upload.single('image'), 
  (req: Request, res: Response, next: NextFunction) => {
   
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }
    next();
  },
  UserControllers.updateProfile
);
router.get(
  '/my-followers', 
  auth(USER_ROLE.member, USER_ROLE.admin), 
  UserControllers.getMyFollowers
);

router.get(
  '/my-following', 
  auth(USER_ROLE.member, USER_ROLE.admin), 
  UserControllers.getMyFollowing
);
router.patch(
  '/follow/:id',
  auth(USER_ROLE.member, USER_ROLE.admin),
  UserControllers.followUser
);

router.patch(
  '/unfollow/:id',
  auth(USER_ROLE.member, USER_ROLE.admin),
  UserControllers.unfollowUser
);
router.get('/:id', auth(USER_ROLE.member, USER_ROLE.admin), UserControllers.getSingleUser);

router.get('/followers/:id', auth(USER_ROLE.member, USER_ROLE.admin), UserControllers.getFollowersList);
router.get('/following/:id', auth(USER_ROLE.member, USER_ROLE.admin), UserControllers.getFollowingList);

export const UserRoutes = router;