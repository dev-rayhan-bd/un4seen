import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { MusicServices } from './music.services';
import uploadImage from '../../middleware/upload'; 

const uploadMusic = catchAsync(async (req: Request, res: Response) => {
  const audioUrl = await uploadImage(req); 
  const result = await MusicServices.createMusicInDB({
    ...JSON.parse(req.body.data),
    audioUrl,
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Music uploaded to library',
    data: result,
  });
});

const getMusicLibrary = catchAsync(async (req: Request, res: Response) => {
  const result = await MusicServices.getAllMusicFromDB(req.user.userId, req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Music library retrieved',
    data: result,
  });
});

const toggleFavorite = catchAsync(async (req: Request, res: Response) => {
  const result = await MusicServices.toggleFavoriteMusicInDB(req.user.userId, req.params.id as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: result,
  });
});
const getCategories = catchAsync(async (req: Request, res: Response) => {
  const result = await MusicServices.getCategoriesFromDB();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Categories retrieved successfully',
    data: result,
  });
});

const deleteMusic = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await MusicServices.deleteMusicFromDB(id as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Music deleted successfully from library',
    data: null,
  });
});
const getMyFavorites = catchAsync(async (req: Request, res: Response) => {
  const result = await MusicServices.getMyFavoriteMusicFromDB(req.user.userId, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Favorite music retrieved successfully',
    data: result,
  });
});
export const MusicControllers = { uploadMusic, getMusicLibrary, toggleFavorite, getCategories, deleteMusic,getMyFavorites };