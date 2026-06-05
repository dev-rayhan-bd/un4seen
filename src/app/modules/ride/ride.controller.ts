import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { RideServices } from './ride.services';
import uploadImage from '../../middleware/upload';
import AppError from '../../errors/AppError';

const createRide = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  

  const rideData = req.body; 


  if (req.file) {
    const imageUrl = await uploadImage(req); 
    rideData.image = imageUrl;
  } else {
    throw new AppError(httpStatus.BAD_REQUEST, "Bike image is required");
  }


  const result = await RideServices.createRideInDB({
    ...rideData,
    user: userId,
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Ride uploaded successfully!',
    data: result,
  });
});

const getAllRides = catchAsync(async (req: Request, res: Response) => {
  const result = await RideServices.getAllRidesFromDB(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Ride feed retrieved',
    data: result,
  });
});

const toggleHeart = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await RideServices.toggleHeartInDB(req.user.userId, id as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.isHearted ? 'Heart added' : 'Heart removed',
    data: result,
  });
});

const getLeaderboard = catchAsync(async (req, res) => {
  const result = await RideServices.getLeaderboardFromDB();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Weekly leaderboard retrieved',
    data: result,
  });
});
const makeBikeOfWeek = catchAsync(async (req, res) => {
  const result = await RideServices.setBikeOfTheWeekInDB(req.params.id as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Bike of the Week selected and winner rewarded!',
    data: result,
  });
});
export const RideControllers = { createRide, getAllRides, toggleHeart, getLeaderboard, makeBikeOfWeek};