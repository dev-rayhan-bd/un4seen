import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { Story } from './story.model';
import axios from 'axios';


const generateAIMusic = async (mood: string) => {
  try {
    const response = await axios.post('https://api.mubert.com/v2/generate', {
      method: 'generate_track',
      params: {
        api_key: process.env.MUBERT_API_KEY,
        tags: [mood, 'motocross'],
        duration: 30
      }
    });
    return response.data.data.audio_url;
  } catch (error) {
    console.error("AI Music Error:", error);
    return null; 
  }
};

const createStoryInDB = async (userId: string, payload: any) => {
  const combinedInput = [payload.mood, payload.prompt].filter(Boolean).join(", ");

  if (combinedInput && process.env.MUBERT_API_KEY) {
    console.log(`🎵 Generating AI Music for: ${combinedInput}...`);
    
    const musicUrl = await generateAIMusic(combinedInput);
    if (musicUrl) {
      payload.musicUrl = musicUrl;
    }
  }

  const result = await Story.create({
    ...payload,
    user: userId,
  });

  return result;
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
import { SavedStory } from './savedStory.model';
import moment from 'moment';


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

const getMySavedStoriesFromDB = async (userId: string) => {
  return await SavedStory.find({ user: userId })
    .populate({
      path: 'story',
      populate: { path: 'user', select: 'firstName lastName image memberNumber' }
    })
    .sort({ createdAt: -1 });
};


const getAllStoriesFromDB = async (currentUserId: string) => {

  const stories = await Story.find({ 
    isDeleted: false,
    expiresAt: { $gt: new Date() } 
  })
    .populate('user', 'firstName lastName image memberNumber')
    .sort({ createdAt: -1 });

  const storiesWithStatus = await Promise.all(
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

  return storiesWithStatus;
};
export const StoryServices = { createStoryInDB, getAllStoriesFromDB, toggleHeartInDB, toggleSaveStoryInDB, getMySavedStoriesFromDB };