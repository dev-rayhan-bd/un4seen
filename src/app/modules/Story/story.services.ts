import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { Story } from './story.model';

import { SavedStory } from './savedStory.model';
import moment from 'moment';



const createStoryInDB = async (userId: string, payload: any) => {

  const result = await Story.create({
    ...payload,
    user: userId,
  });
  const populatedStory = await Story.findById(result._id)
    .populate('user', 'firstName lastName image memberNumber')
    .populate('music', 'title audioUrl category');

  return {
    ...populatedStory!.toObject(),
    isOwnStory: true,
    isHearted: false,
    isSaved: false,
    timeAgo: 'just now',
  };
};

const getAllStoriesFromDB = async (currentUserId: string, userRole: string, isDeleted?: boolean, isOwnStory?: boolean) => {
  const query: any = { 
    expiresAt: { $gt: new Date() } 
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

  const stories = await Story.find(query)
    .populate('user', 'firstName lastName image memberNumber')
    .populate('music', 'title audioUrl category') 
    .sort({ createdAt: -1 });

  return await Promise.all(
    stories.map(async (story) => {
      const isSaved = await SavedStory.exists({ user: currentUserId, story: story._id });
      return {
        ...story.toObject(),
        isOwnStory: (story.user as any)._id.toString() === currentUserId,
        isHearted: story.hearts.includes(currentUserId as any),
        isSaved: !!isSaved,
        timeAgo: moment(story.createdAt).fromNow(), 
      };
    })
  );
};



// const getMySavedStoriesFromDB = async (userId: string) => {
//   const saved = await SavedStory.find({ user: userId })
//     .populate({
//       path: 'story',
//       populate: [
//         { path: 'user', select: 'firstName lastName image memberNumber' },
//         { path: 'music', select: 'title audioUrl' } 
//       ]
//     })
//     .sort({ createdAt: -1 });

//   return saved.map(s => ({
//     ...s.toObject(),
//     timeAgo: moment(s.createdAt).fromNow()
//   }));
// };


const getMySavedStoriesFromDB = async (userId: string) => {
  const saved = await SavedStory.find({ user: userId })
    .populate({
      path: 'story',
      match: { isDeleted: false }, 
      populate: [
        { path: 'user', select: 'firstName lastName image memberNumber' },
        { path: 'music', select: 'title audioUrl' } 
      ]
    })
    .sort({ createdAt: -1 });


  return saved
    .filter(s => s.story !== null) 
    .map(s => {
      const storyObj = (s.story as any);
      return {
        ...s.toObject(),
        isOwnStory: storyObj.user?._id?.toString() === userId,
        isHearted: storyObj.hearts?.includes(userId as any) ?? false,
        isSaved: true,
        timeAgo: moment(storyObj.createdAt).fromNow()
      };
    });
};

const toggleHeartInDB = async (userId: string, storyId: string) => {
  const story = await Story.findById(storyId);
  if (!story) throw new AppError(httpStatus.NOT_FOUND, 'Story not found');

  const isHearted = story.hearts.includes(userId as any);
  if (isHearted) {
    return await Story.findByIdAndUpdate(storyId, { $pull: { hearts: userId }, $inc: { heartCount: -1 } }, { new: true });
  } else {
    return await Story.findByIdAndUpdate(storyId, { $addToSet: { hearts: userId }, $inc: { heartCount: 1 } }, { new: true });
  }
};





const toggleSaveStoryInDB = async (userId: string, storyId: string) => {
  const alreadySaved = await SavedStory.findOne({ user: userId, story: storyId });

  if (alreadySaved) {
    await SavedStory.findByIdAndDelete(alreadySaved._id);
    return { isSaved: false, message: "Story removed from saved" };
  } else {
    await SavedStory.create({ user: userId, story: storyId });
    return { isSaved: true, message: "Story saved successfully" };
  }
};

const deleteStoryFromDB = async (storyId: string, userId: string) => {
  const story = await Story.findOne({ _id: storyId, user: userId, isDeleted: false });
  if (!story) throw new AppError(httpStatus.NOT_FOUND, 'Story not found or unauthorized');

  await Story.findByIdAndUpdate(storyId, { isDeleted: true });
  await SavedStory.deleteMany({ story: storyId });

  return { message: 'Story deleted successfully' };
};


export const StoryServices = { createStoryInDB, getAllStoriesFromDB, toggleHeartInDB, toggleSaveStoryInDB, getMySavedStoriesFromDB, deleteStoryFromDB };