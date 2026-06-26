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

  const result = await RideServices.createRideInDB({ ...rideData, user: userId });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Ride uploaded successfully!',
    data: result,
  });
});

const getAllRides = catchAsync(async (req: Request, res: Response) => {
  const result = await RideServices.getAllRidesFromDB(req.query, req.user?.userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Ride feed retrieved',
    data: result,
  });
});

const submitVote = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { rating } = req.body;
  const result = await RideServices.voteRideInDB(req.user.userId, id as string, rating);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Rating submitted',
    data: { averageRating: result.averageRating, flameCount: result.flameCount },
  });
});

const getLeaderboard = catchAsync(async (req, res) => {
  const result = await RideServices.getLeaderboardFromDB();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Leaderboard retrieved',
    data: result,
  });
});

const makeBikeOfWeek = catchAsync(async (req, res) => {
  const result = await RideServices.setBikeOfTheWeekInDB(req.params.id as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Winner declared and points rewarded!',
    data: result,
  });
});
const deleteRide = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId } = req.user;

  await RideServices.deleteMyRideFromDB(userId as string, id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Ride deleted successfully. You can now upload a new one.',
    data: null,
  });
});
export const RideControllers = { createRide, getAllRides, submitVote, getLeaderboard, makeBikeOfWeek ,deleteRide};