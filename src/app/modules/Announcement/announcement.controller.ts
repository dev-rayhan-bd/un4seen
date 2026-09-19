import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import uploadImage from '../../middleware/upload';
import { AnnouncementServices } from './announcement.services';
import { getIO } from '../../utils/socket';

const createAnnouncement = catchAsync(async (req: Request, res: Response) => {
  const data = req.body;

  if (req.file) {
    const contentUrl = await uploadImage(req);
    data.content = contentUrl;
  }

  const result = await AnnouncementServices.createAnnouncementInDB(req.user.userId, data);
  try {
    const io = getIO();
    if (io) {
      io.emit('NEW_ANNOUNCEMENT', result);
    }
  } catch (error) {
    // socket might not be initialized in test environment
  }

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Announcement story posted successfully!',
    data: result,
  });
});

const getAnnouncements = catchAsync(async (req: Request, res: Response) => {
  const isDeleted =
    req.query.isDeleted === 'true' ? true : req.query.isDeleted === 'false' ? false : undefined;
  const isOwnStory =
    req.query.isOwnStory === 'true' ? true : req.query.isOwnStory === 'false' ? false : undefined;
  const result = await AnnouncementServices.getAllAnnouncementsFromDB(
    req.user.userId,
    req.user.role,
    isDeleted,
    isOwnStory
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Announcements retrieved successfully',
    data: result,
  });
});

const toggleHeart = catchAsync(async (req: Request, res: Response) => {
  const result = await AnnouncementServices.toggleHeartInDB(req.user.userId, req.params.id as string);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Heart toggled',
    data: result,
  });
});

const toggleSaveAnnouncement = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await AnnouncementServices.toggleSaveAnnouncementInDB(req.user.userId, id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.message,
    data: result,
  });
});

const getSavedAnnouncements = catchAsync(async (req: Request, res: Response) => {
  const result = await AnnouncementServices.getMySavedAnnouncementsFromDB(req.user.userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Saved announcements retrieved successfully',
    data: result,
  });
});

const deleteAnnouncement = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await AnnouncementServices.deleteAnnouncementFromDB(
    id as string,
    req.user.userId,
    req.user.role
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Announcement deleted successfully',
    data: result,
  });
});

export const AnnouncementControllers = {
  createAnnouncement,
  getAnnouncements,
  toggleHeart,
  toggleSaveAnnouncement,
  getSavedAnnouncements,
  deleteAnnouncement,
};
