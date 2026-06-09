import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import uploadImage from '../../middleware/upload';
import { StoryServices } from './story.services';

const createStory = catchAsync(async (req: Request, res: Response) => {
  const data = req.body; 

  if (req.file) {
    const contentUrl = await uploadImage(req);
    data.content = contentUrl;
  }

  const result = await StoryServices.createStoryInDB(req.user.userId, data);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Story posted successfully!',
    data: result,
  });
});

const getStories = catchAsync(async (req: Request, res: Response) => {
  const result = await StoryServices.getAllStoriesFromDB(req.user.userId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Stories retrieved successfully',
    data: result,
  });
});

const toggleHeart = catchAsync(async (req: Request, res: Response) => {
  const result = await StoryServices.toggleHeartInDB(req.user.userId, req.params.id as string);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Heart toggled',
    data: result,
  });
});
const toggleSaveStory = catchAsync(async (req, res) => {
  const { id } = req.params; // Story ID
  const result = await StoryServices.toggleSaveStoryInDB(req.user.userId, id as string);
  
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.message,
    data: result,
  });
});

const getSavedStories = catchAsync(async (req, res) => {
  const result = await StoryServices.getMySavedStoriesFromDB(req.user.userId);
  
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Saved stories retrieved successfully',
    data: result,
  });
});
export const StoryControllers = { createStory, getStories, toggleHeart, toggleSaveStory, getSavedStories };