import express, { NextFunction, Request, Response } from 'express';
import auth from '../../middleware/auth';
import { upload } from '../../middleware/multer';
import validateRequest from '../../middleware/validateRequest';
import { AnnouncementControllers } from './announcement.controller';
import { AnnouncementValidations } from './announcement.validation';
import { USER_ROLE } from '../Auth/auth.constant';

const router = express.Router();

router.post(
  '/create',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  upload.single('content'),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }
    next();
  },
  validateRequest(AnnouncementValidations.createAnnouncementSchema),
  AnnouncementControllers.createAnnouncement
);

router.get(
  '/',
  auth(USER_ROLE.member, USER_ROLE.admin, USER_ROLE.superAdmin, USER_ROLE.guest),
  AnnouncementControllers.getAnnouncements
);

router.patch(
  '/:id/heart',
  auth(USER_ROLE.member, USER_ROLE.admin, USER_ROLE.superAdmin),
  AnnouncementControllers.toggleHeart
);

router.post(
  '/:id/save',
  auth(USER_ROLE.member, USER_ROLE.admin, USER_ROLE.superAdmin),
  AnnouncementControllers.toggleSaveAnnouncement
);

router.get(
  '/my-saved',
  auth(USER_ROLE.member, USER_ROLE.admin, USER_ROLE.superAdmin),
  AnnouncementControllers.getSavedAnnouncements
);

router.delete(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  AnnouncementControllers.deleteAnnouncement
);

export const AnnouncementRoutes = router;
