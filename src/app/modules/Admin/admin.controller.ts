import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AdminServices } from './admin.services';
import AppError from '../../errors/AppError';
import uploadImage from '../../middleware/upload';

const getDashboardStats = catchAsync(async (req: Request, res: Response) => {

  const year = req.query.year 
    ? parseInt(req.query.year as string) 
    : new Date().getFullYear();


  const result = await AdminServices.getDashboardStatsFromDB(year);


  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Admin dashboard statistics retrieved successfully',
    data: result,
  });
});
const uploadPopupVideo = catchAsync(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new AppError(httpStatus.BAD_REQUEST, "Please select a video file");
  }


  const videoUrl = await uploadImage(req); 

  const result = await AdminServices.uploadPopupVideoToDB(videoUrl);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Popup video uploaded successfully',
    data: result,
  });
});

const getPopupVideo = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminServices.getActivePopupVideoFromDB();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Popup video retrieved successfully',
    data: result,
  });
});
export const AdminControllers = {
  getDashboardStats,
  uploadPopupVideo,
  getPopupVideo
};