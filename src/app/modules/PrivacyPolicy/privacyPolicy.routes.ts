import express from 'express';
import { USER_ROLE } from '../Auth/auth.constant';
import PrivacyPolicyController from './PrivacyPolicy.controller';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { PrivacyPolicyValidations } from './privacyPolicy.validation';

const privacyPolicyRouter = express.Router();

// Route to create or update Privacy Policy content (only accessible to admin or super-admin)
privacyPolicyRouter.post(
  '/create-or-update',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  validateRequest(PrivacyPolicyValidations.createOrUpdatePrivacyPolicyValidationSchema),
  PrivacyPolicyController.createOrUpdatePrivacyPolicy,
);

// Route to retrieve Privacy Policy content (accessible to everyone)
privacyPolicyRouter.get(
  '/retrive',
  PrivacyPolicyController.getPrivacyPolicy,
);

export default privacyPolicyRouter;