import express from 'express';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../Auth/auth.constant';
import { MotivationalQuoteControllers } from './motivationalQuote.controller';

const router = express.Router();

router.post(
  '/bulk',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  MotivationalQuoteControllers.upsertBulkQuotes
);

router.post(
  '/',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  MotivationalQuoteControllers.createQuote
);

router.get(
  '/today',
  // auth(USER_ROLE.member, USER_ROLE.admin, USER_ROLE.superAdmin), // Optional: depend on requirements
  MotivationalQuoteControllers.getTodayQuote
);

router.get(
  '/',
  // auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  MotivationalQuoteControllers.getAllQuotes
);

router.get(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  MotivationalQuoteControllers.getQuoteById
);

router.patch(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  MotivationalQuoteControllers.updateQuote
);

router.delete(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  MotivationalQuoteControllers.deleteQuote
);

export const MotivationalQuoteRoutes = router;
