import express from 'express';
import { USER_ROLE } from '../Auth/auth.constant';
import aboutController from './about.controller';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { AboutValidations } from './about.validation';

const aboutRouter = express.Router();

// Route to create or update About Us content (only accessible to admin or super-admin)
aboutRouter.post(
  '/create-or-update',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  validateRequest(AboutValidations.createOrUpdateAboutValidationSchema),
  aboutController.createOrUpdateAbout,
);

// Route to retrieve About Us content (accessible to everyone)
aboutRouter.get(
  '/retrive',
  aboutController.getAbout,
);

export default aboutRouter;