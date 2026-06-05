import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';

import uploadImage from '../../middleware/upload';
import { CompetitionServices } from './competition.services';
import { Request, Response } from 'express';
import AppError from '../../errors/AppError';

const submitEntry = catchAsync(async (req: Request, res: Response) => {
  // রাউটের মিডলওয়্যার আগেই req.body.data কে পার্স করে req.body তে সেট করে দিয়েছে
  const payload = req.body; 

  if (!req.file) {
    throw new AppError(httpStatus.BAD_REQUEST, "Design image is required");
  }

  // ইমেজ আপলোড
  const imageUrl = await uploadImage(req); 
  payload.image = imageUrl;

  const result = await CompetitionServices.submitEntryInDB(req.user.userId, payload);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Entry submitted successfully!',
    data: result,
  });
});
const getGallery = catchAsync(async (req, res) => {
  const result = await CompetitionServices.getCompetitionGallery(req.params.id as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Gallery retrieved',
    data: result,
  });
});

const createCompetition = catchAsync(async (req: Request, res: Response) => {
  let competitionData = req.body;


  if (req.body.data) {
    competitionData = JSON.parse(req.body.data);
  }


  if (req.file) {
    const imageUrl = await uploadImage(req); 
    competitionData.image = imageUrl;
  } else {
    throw new AppError(httpStatus.BAD_REQUEST, "Competition banner image is required");
  }

  const result = await CompetitionServices.createCompetitionIntoDB(competitionData);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Competition created successfully with banner!',
    data: result,
  });
});


const getAllCompetitions = catchAsync(async (req: Request, res: Response) => {
  const result = await CompetitionServices.getAllCompetitionsFromDB(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Competition history retrieved successfully',
    data: result,
  });
});


const toggleHeartEntry = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params; // entry id
  const result = await CompetitionServices.toggleHeartInDB(req.user.userId, id as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.isHearted ? 'Heart added to design' : 'Heart removed',
    data: result,
  });
});

const getLeaderboard = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params; // competition id
  const result = await CompetitionServices.getLeaderboardFromDB(id as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Top 10 leaderboard retrieved',
    data: result,
  });
});


const makeWinner = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params; // entry id
  const result = await CompetitionServices.setWinnerInDB(id as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Contest winner announced and points rewarded!',
    data: result,
  });
});
const getRunningCompetition = catchAsync(async (req: Request, res: Response) => {
  const currentUserId = req.user?.userId;
  const result = await CompetitionServices.getRunningCompetitionFromDB(currentUserId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Running competition retrieved successfully',
    data: result,
  });
});



const updateCompetition = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  let competitionData = req.body;

  if (req.body.data) {
    competitionData = JSON.parse(req.body.data);
  }

  if (req.file) {
    const imageUrl = await uploadImage(req);
    competitionData.image = imageUrl;
  }

  const result = await CompetitionServices.updateCompetitionInDB(id as string, competitionData);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Competition updated successfully',
    data: result,
  });
});

const deleteCompetition = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await CompetitionServices.deleteCompetitionFromDB(id as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Competition and its entries deleted successfully',
    data: null,
  });
});




export const CompetitionControllers = {
  submitEntry,
  getGallery,
  createCompetition,
  getAllCompetitions,
  toggleHeartEntry,
  getLeaderboard,
  makeWinner,
    getRunningCompetition,
    updateCompetition,
    deleteCompetition
};
