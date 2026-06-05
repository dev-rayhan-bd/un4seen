import express, { NextFunction, Request, Response } from 'express';
import auth from '../../middleware/auth';
import { RideControllers } from './ride.controller';
import { upload } from '../../middleware/multer';
import validateRequest from '../../middleware/validateRequest';
import { RideValidations } from './ride.validation';

const router = express.Router();

router.post(
  '/upload',
  auth('member', 'admin'),
  upload.single('image'), 
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }
    next();
  },
  validateRequest(RideValidations.createRideValidationSchema),
  RideControllers.createRide
);

router.get('/', auth('member', 'admin', 'guest'), RideControllers.getAllRides);
router.patch('/:id/heart', auth('member', 'admin'), RideControllers.toggleHeart);
router.get('/leaderboard', auth('member', 'admin', 'guest'), RideControllers.getLeaderboard);
router.patch('/:id/set-winner', auth('admin', 'superAdmin'), RideControllers.makeBikeOfWeek);
export const RideRoutes = router;