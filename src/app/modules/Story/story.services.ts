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

  const aiInput = payload.prompt || payload.mood;

  if (aiInput && process.env.MUBERT_API_KEY) {
    console.log(`🎵 Generating AI Music for: ${aiInput}...`);
    

    const musicUrl = await generateAIMusic(aiInput);
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

const getAllStoriesFromDB = async (currentUserId: string) => {
  const stories = await Story.find({ isDeleted: false })
    .populate('user', 'firstName lastName image memberNumber')
    .sort({ createdAt: -1 });

  return stories.map(story => ({
    ...story.toObject(),
    isHearted: story.hearts.includes(currentUserId as any)
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

export const StoryServices = { createStoryInDB, getAllStoriesFromDB, toggleHeartInDB };