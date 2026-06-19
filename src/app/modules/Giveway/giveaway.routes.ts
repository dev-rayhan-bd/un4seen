import express from 'express';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../Auth/auth.constant';
import { GiveawayControllers } from './giveaway.controller';
import { upload } from '../../middleware/multer';


const router = express.Router();


router.get(
  '/all', 
  auth(USER_ROLE.member, USER_ROLE.admin, USER_ROLE.superAdmin, USER_ROLE.guest), 
  GiveawayControllers.getAllGiveaways
);

router.get(
  '/active', 
  auth(USER_ROLE.member, USER_ROLE.admin, USER_ROLE.superAdmin, USER_ROLE.guest), 
  GiveawayControllers.getActiveGiveaway
);
router.get(
  '/page-data',
  auth(USER_ROLE.member, USER_ROLE.admin, USER_ROLE.guest),
  GiveawayControllers.getGiveawayPageData
);
router.get(
  '/:id', 
  auth(USER_ROLE.member, USER_ROLE.admin, USER_ROLE.superAdmin), 
  GiveawayControllers.getSingleGiveaway
);


router.post(
  '/create',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  upload.single('image'),
  (req, res, next) => {
    if (req.body.data) req.body = JSON.parse(req.body.data);
    next();
  },
  GiveawayControllers.createGiveaway
);

router.patch(
  '/:id/set-winner', 
  auth(USER_ROLE.admin, USER_ROLE.superAdmin), 
  GiveawayControllers.setGiveawayWinner
);
router.patch(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  upload.single('image'),
  GiveawayControllers.updateGiveaway
);

router.delete(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  GiveawayControllers.deleteGiveaway
);
router.post(
  '/create',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  upload.single('image'), 
  (req, res, next) => {
    if (req.body.data) req.body = JSON.parse(req.body.data); 
    next();
  },
  GiveawayControllers.createGiveaway
);
export const GiveawayRoutes = router;