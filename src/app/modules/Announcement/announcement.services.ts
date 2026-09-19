import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { Announcement } from './announcement.model';
import { SavedAnnouncement } from './savedAnnouncement.model';
import moment from 'moment';

const createAnnouncementInDB = async (userId: string, payload: any) => {
  const result = await Announcement.create({
    ...payload,
    user: userId,
  });
  const populatedAnnouncement = await Announcement.findById(result._id)
    .populate('user', 'firstName lastName image memberNumber role')
    .populate('music', 'title audioUrl category');

  return {
    ...populatedAnnouncement!.toObject(),
    isOwnStory: true,
    isOwnAnnouncement: true,
    isHearted: false,
    isSaved: false,
    timeAgo: 'just now',
  };
};

const getAllAnnouncementsFromDB = async (
  currentUserId: string,
  userRole: string,
  isDeleted?: boolean,
  isOwnStory?: boolean
) => {
  const query: any = {
    expiresAt: { $gt: new Date() },
  };

  if (isDeleted !== undefined) {
    query.isDeleted = isDeleted;
  } else {
    query.isDeleted = false;
  }

  if (isOwnStory === true) {
    query.user = currentUserId;
  } else if (isOwnStory === false) {
    query.user = { $ne: currentUserId };
  }

  if (userRole === 'guest') {
    query.isPremium = false;
  }

  const announcements = await Announcement.find(query)
    .populate('user', 'firstName lastName image memberNumber role')
    .populate('music', 'title audioUrl category')
    .sort({ createdAt: -1 });

  return await Promise.all(
    announcements.map(async (announcement) => {
      const isSaved = await SavedAnnouncement.exists({
        user: currentUserId,
        announcement: announcement._id,
      });
      return {
        ...announcement.toObject(),
        isOwnStory: (announcement.user as any)?._id?.toString() === currentUserId,
        isOwnAnnouncement: (announcement.user as any)?._id?.toString() === currentUserId,
        isHearted: announcement.hearts.includes(currentUserId as any),
        isSaved: !!isSaved,
        timeAgo: moment(announcement.createdAt).fromNow(),
      };
    })
  );
};

const getMySavedAnnouncementsFromDB = async (userId: string) => {
  const saved = await SavedAnnouncement.find({ user: userId })
    .populate({
      path: 'announcement',
      match: { isDeleted: false },
      populate: [
        { path: 'user', select: 'firstName lastName image memberNumber role' },
        { path: 'music', select: 'title audioUrl' },
      ],
    })
    .sort({ createdAt: -1 });

  return saved
    .filter((s) => s.announcement !== null)
    .map((s) => {
      const annObj = s.announcement as any;
      return {
        ...s.toObject(),
        isOwnStory: annObj.user?._id?.toString() === userId,
        isOwnAnnouncement: annObj.user?._id?.toString() === userId,
        isHearted: annObj.hearts?.includes(userId as any) ?? false,
        isSaved: true,
        timeAgo: moment(annObj.createdAt).fromNow(),
      };
    });
};

const toggleHeartInDB = async (userId: string, announcementId: string) => {
  const announcement = await Announcement.findById(announcementId);
  if (!announcement) throw new AppError(httpStatus.NOT_FOUND, 'Announcement not found');

  const isHearted = announcement.hearts.includes(userId as any);
  if (isHearted) {
    return await Announcement.findByIdAndUpdate(
      announcementId,
      { $pull: { hearts: userId }, $inc: { heartCount: -1 } },
      { new: true }
    );
  } else {
    return await Announcement.findByIdAndUpdate(
      announcementId,
      { $addToSet: { hearts: userId }, $inc: { heartCount: 1 } },
      { new: true }
    );
  }
};

const toggleSaveAnnouncementInDB = async (userId: string, announcementId: string) => {
  const alreadySaved = await SavedAnnouncement.findOne({
    user: userId,
    announcement: announcementId,
  });

  if (alreadySaved) {
    await SavedAnnouncement.findByIdAndDelete(alreadySaved._id);
    return { isSaved: false, message: 'Announcement removed from saved' };
  } else {
    await SavedAnnouncement.create({ user: userId, announcement: announcementId });
    return { isSaved: true, message: 'Announcement saved successfully' };
  }
};

const deleteAnnouncementFromDB = async (announcementId: string, userId: string, userRole: string) => {
  let query: any = { _id: announcementId, isDeleted: false };
  // If not superAdmin or admin, enforce own announcement check
  if (userRole !== 'admin' && userRole !== 'superAdmin') {
    query.user = userId;
  }

  const announcement = await Announcement.findOne(query);
  if (!announcement) throw new AppError(httpStatus.NOT_FOUND, 'Announcement not found or unauthorized');

  await Announcement.findByIdAndUpdate(announcementId, { isDeleted: true });
  await SavedAnnouncement.deleteMany({ announcement: announcementId });

  return { message: 'Announcement deleted successfully' };
};

export const AnnouncementServices = {
  createAnnouncementInDB,
  getAllAnnouncementsFromDB,
  toggleHeartInDB,
  toggleSaveAnnouncementInDB,
  getMySavedAnnouncementsFromDB,
  deleteAnnouncementFromDB,
};
