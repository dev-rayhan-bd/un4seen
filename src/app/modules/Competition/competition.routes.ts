import express from 'express';
import auth from '../../middleware/auth';
import { upload } from '../../middleware/multer';
import { CompetitionControllers } from './competition.controller';
import { USER_ROLE } from '../Auth/auth.constant';
import { CompetitionValidations } from './competition.validation';
import validateRequest from '../../middleware/validateRequest';

const router = express.Router();

router.post(
  '/submit-entry',
  auth(USER_ROLE.member),
  upload.single('image'),
  (req, res, next) => {
    if (req.body.data) req.body = JSON.parse(req.body.data);
    next();
  },
  validateRequest(CompetitionValidations.submitEntrySchema),
  CompetitionControllers.submitEntry
);

router.patch(
  '/entry/:id/heart',
  auth(USER_ROLE.member, USER_ROLE.admin),
  CompetitionControllers.toggleHeartEntry
);


router.get('/all', CompetitionControllers.getAllCompetitions);
router.get('/running', CompetitionControllers.getRunningCompetition);



router.get('/gallery/:id', CompetitionControllers.getGallery);

router.get('/leaderboard/:id', CompetitionControllers.getLeaderboard);


router.post(
  '/create',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  upload.single('image'), 
  (req, res, next) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }
    next();
  },
  validateRequest(CompetitionValidations.createCompetitionSchema),
  CompetitionControllers.createCompetition
);

router.patch(
  '/entry/:id/make-winner',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  CompetitionControllers.makeWinner
);
router.patch(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  upload.single('image'),
  (req, res, next) => {
    if (req.body.data) req.body = JSON.parse(req.body.data);
    next();
  },
  CompetitionControllers.updateCompetition
);

router.delete(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  CompetitionControllers.deleteCompetition
);
export const CompetitionRoutes = router;