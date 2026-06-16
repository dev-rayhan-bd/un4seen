import express from 'express';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { ChannelControllers } from './channel.controller';
import { ChannelValidations } from './channel.validation';
import { USER_ROLE } from '../Auth/auth.constant';
import { upload } from '../../middleware/multer';

const router = express.Router();


router.get('/my-chats', auth(USER_ROLE.member, USER_ROLE.admin), ChannelControllers.getMyChats);

router.post('/private', auth(USER_ROLE.member), validateRequest(ChannelValidations.startPrivateChatSchema), ChannelControllers.startPrivateChat);
router.post('/group', auth(USER_ROLE.member, USER_ROLE.admin), validateRequest(ChannelValidations.createGroupSchema), ChannelControllers.createGroup);

router.get('/:id/messages', auth(USER_ROLE.member, USER_ROLE.admin), ChannelControllers.getMessages);

router.post('/report', auth(USER_ROLE.member), validateRequest(ChannelValidations.reportMessageSchema), ChannelControllers.reportMessage);

router.post(
  '/upload-file',
  auth(USER_ROLE.member, USER_ROLE.admin),
  upload.single('file'), 
  ChannelControllers.uploadAttachment
);
export const ChannelRoutes = router;