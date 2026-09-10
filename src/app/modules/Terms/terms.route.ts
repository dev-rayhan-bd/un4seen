import express from 'express';
import { USER_ROLE } from '../Auth/auth.constant';
import termsController from './terms.controller';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { TermsValidations } from './terms.validation';

const termsRouter = express.Router();

// Route to create or update Terms & Conditions (only accessible to admin or super-admin)
termsRouter.post(
  '/create-or-update',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  validateRequest(TermsValidations.createOrUpdateTermsValidationSchema),
  termsController.createOrUpdateTerms,
);

// Route to retrieve Terms & Conditions (accessible to everyone)
termsRouter.get(
  '/retrive',
  termsController.getTerms,
);

export default termsRouter;