import express, { NextFunction, Request, Response } from 'express';
import auth from '../../middleware/auth';
import { upload } from '../../middleware/multer';
import validateRequest from '../../middleware/validateRequest';
import { SupportChatControllers } from './supportChat.controller';
import { SupportChatValidations } from './supportChat.validation';
import { USER_ROLE } from '../Auth/auth.constant';

const router = express.Router();

router.post(
  '/send-message',
  auth(USER_ROLE.member, USER_ROLE.admin, USER_ROLE.superAdmin, USER_ROLE.guest),
  upload.single('file'),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }
    next();
  },
  validateRequest(SupportChatValidations.sendSupportMessageSchema),
  SupportChatControllers.sendMessage
);

router.get(
  '/my-chat',
  auth(USER_ROLE.member, USER_ROLE.admin, USER_ROLE.superAdmin, USER_ROLE.guest),
  SupportChatControllers.getMySupportChat
);

router.get(
  '/admin/sessions',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  SupportChatControllers.getAllSessionsForAdmin
);

router.get(
  '/session/:sessionId/messages',
  auth(USER_ROLE.member, USER_ROLE.admin, USER_ROLE.superAdmin, USER_ROLE.guest),
  SupportChatControllers.getSessionMessages
);

router.patch(
  '/session/:sessionId/status',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  validateRequest(SupportChatValidations.updateSupportSessionStatusSchema),
  SupportChatControllers.updateSessionStatus
);

export const SupportChatRoutes = router;
