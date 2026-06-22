import express, { NextFunction, Request, Response } from 'express';
import auth from '../../middleware/auth';
import { RideControllers } from './ride.controller';
import { upload } from '../../middleware/multer';
import validateRequest from '../../middleware/validateRequest';
import { RideValidations } from './ride.validation';
import { USER_ROLE } from '../Auth/auth.constant';

const router = express.Router();

router.post(
  '/upload',
  auth(USER_ROLE.member, USER_ROLE.admin),
  upload.single('image'), 
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) req.body = JSON.parse(req.body.data);
    next();
  },
  validateRequest(RideValidations.createRideValidationSchema),
  RideControllers.createRide
);

router.get('/', auth(USER_ROLE.member, USER_ROLE.admin, USER_ROLE.superAdmin), RideControllers.getAllRides);

router.patch(
  '/:id/vote', 
  auth(USER_ROLE.member, USER_ROLE.admin), 
  validateRequest(RideValidations.voteRideValidationSchema),
  RideControllers.submitVote
);

router.get('/leaderboard', auth(USER_ROLE.member, USER_ROLE.admin, USER_ROLE.superAdmin), RideControllers.getLeaderboard);

router.patch('/:id/set-winner',
   auth(USER_ROLE.admin, USER_ROLE.superAdmin),
    RideControllers.makeBikeOfWeek);

export const RideRoutes = router;