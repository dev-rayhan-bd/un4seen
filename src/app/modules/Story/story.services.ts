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
  return populatedStory;
};

const getAllStoriesFromDB = async (currentUserId: string, userRole: string) => {
  const query: any = { 
    isDeleted: false, 
    expiresAt: { $gt: new Date() } 
  };


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
        isHearted: story.hearts.includes(currentUserId as any),
        isSaved: !!isSaved,
        timeAgo: moment(story.createdAt).fromNow(), 
      };
    })
  );
};



const getMySavedStoriesFromDB = async (userId: string) => {
  const saved = await SavedStory.find({ user: userId })
    .populate({
      path: 'story',
      populate: [
        { path: 'user', select: 'firstName lastName image memberNumber' },
        { path: 'music', select: 'title audioUrl' } 
      ]
    })
    .sort({ createdAt: -1 });

  return saved.map(s => ({
    ...s.toObject(),
    timeAgo: moment(s.createdAt).fromNow()
  }));
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


export const StoryServices = { createStoryInDB, getAllStoriesFromDB, toggleHeartInDB, toggleSaveStoryInDB, getMySavedStoriesFromDB };