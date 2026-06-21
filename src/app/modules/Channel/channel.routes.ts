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
router.post('/create', auth(USER_ROLE.member, USER_ROLE.admin), validateRequest(ChannelValidations.createGroupSchema), ChannelControllers.createGroup);
router.get('/sidebar', auth('member', 'admin'), ChannelControllers.getMyJoinedChannels);
router.get('/search-all', auth('member', 'admin'), ChannelControllers.searchChannels);
router.post('/request-join', auth('member'), ChannelControllers.requestToJoin);
router.get('/requests/:channelId', auth('member', 'admin'), ChannelControllers.getJoinRequests);
router.patch('/handle-request', auth('member', 'admin'), ChannelControllers.actionOnRequest);
router.get(
  '/private-history/:otherUserId', 
  auth('member', 'admin'), 
  ChannelControllers.getPrivateHistory
);
router.get(
  '/search-riders', 
  auth('member', 'admin', 'superAdmin'), 
  ChannelControllers.searchRiders
);
router.get('/:id/messages', auth(USER_ROLE.member, USER_ROLE.admin), ChannelControllers.getMessages);

router.post('/report', auth(USER_ROLE.member), ChannelControllers.reportMessage);

router.get(
  '/admin/reports', 
  auth(USER_ROLE.admin, USER_ROLE.superAdmin), 
  ChannelControllers.getReports
);

router.patch(
  '/admin/reports/:id/resolve', 
  auth(USER_ROLE.admin, USER_ROLE.superAdmin), 
  ChannelControllers.resolveReport
);
router.post(
  '/upload-file',
  auth(USER_ROLE.member, USER_ROLE.admin),
  upload.single('file'), 
  ChannelControllers.uploadAttachment
);
router.get('/:id/members', auth('member', 'admin'), ChannelControllers.getChannelMembers);
router.patch(
  '/manage-members',
  auth(USER_ROLE.member, USER_ROLE.admin),
  ChannelControllers.manageMembers
);
export const ChannelRoutes = router;