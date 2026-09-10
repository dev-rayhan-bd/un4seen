import express from 'express';
import { USER_ROLE } from '../Auth/auth.constant';
import giveawayTermsController from './giveawayTerms.controller';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { GiveawayTermsValidations } from './giveawayTerms.validation';

const giveawayTermsRouter = express.Router();

// Route to create or update Giveaway Terms & Eligibility (admin / super-admin only)
giveawayTermsRouter.post(
  '/create-or-update',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  validateRequest(GiveawayTermsValidations.createOrUpdateGiveawayTermsValidationSchema),
  giveawayTermsController.createOrUpdateGiveawayTerms,
);

// Route to retrieve Giveaway Terms & Eligibility (publicly accessible)
giveawayTermsRouter.get(
  '/retrive',
  giveawayTermsController.getGiveawayTerms,
);

export default giveawayTermsRouter;
