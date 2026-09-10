import express from 'express';
import { USER_ROLE } from '../Auth/auth.constant';
import syndicateTermsController from './syndicateTerms.controller';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { SyndicateTermsValidations } from './syndicateTerms.validation';

const syndicateTermsRouter = express.Router();

// Route to create or update Syndicate Terms & Conditions (admin / super-admin only)
syndicateTermsRouter.post(
  '/create-or-update',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  validateRequest(SyndicateTermsValidations.createOrUpdateSyndicateTermsValidationSchema),
  syndicateTermsController.createOrUpdateSyndicateTerms,
);

// Route to retrieve Syndicate Terms & Conditions (publicly accessible)
syndicateTermsRouter.get(
  '/retrive',
  syndicateTermsController.getSyndicateTerms,
);

export default syndicateTermsRouter;
