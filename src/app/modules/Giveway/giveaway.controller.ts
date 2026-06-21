import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { GiveawayServices } from './giveaway.services';
import uploadImage from '../../middleware/upload';
import AppError from '../../errors/AppError';

const getAllGiveaways = catchAsync(async (req: Request, res: Response) => {
  const result = await GiveawayServices.getAllGiveawaysFromDB(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All weekly giveaways retrieved successfully',
    data: result,
  });
});

const getActiveGiveaway = catchAsync(async (req: Request, res: Response) => {
  const result = await GiveawayServices
  .getActiveGiveawayFromDB();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Active giveaway retrieved successfully',
    data: result,
  });
});

const getSingleGiveaway = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await GiveawayServices.getSingleGiveawayFromDB(id as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Giveaway details retrieved successfully',
    data: result,
  });
});

const createGiveaway = catchAsync(async (req: Request, res: Response) => {
  let giveawayData = req.body;

  if (req.body.data) {
    giveawayData = JSON.parse(req.body.data);
  }

  if (req.file) {
    const imageUrl = await uploadImage(req);
    giveawayData.image = imageUrl;
  } else {
    throw new AppError(httpStatus.BAD_REQUEST, "Giveaway prize image is required");
  }

  const result = await GiveawayServices.createGiveawayIntoDB(giveawayData);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Giveaway created successfully!',
    data: result,
  });
});


const setGiveawayWinner = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { winnerId } = req.body;
  const result = await GiveawayServices.updateGiveawayWinnerInDB(id as string, winnerId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Winner announced for this giveaway!',
    data: result,
  });
});
const updateGiveaway = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  let giveawayData = req.body;


  if (req.body.data) {
    giveawayData = JSON.parse(req.body.data);
  }

 
  if (req.file) {
    const imageUrl = await uploadImage(req);
    giveawayData.image = imageUrl;
  }

  const result = await GiveawayServices.updateGiveawayInDB(id as string, giveawayData);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Giveaway updated successfully!',
    data: result,
  });
});
const deleteGiveaway = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await GiveawayServices.deleteGiveawayFromDB(id as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Giveaway deleted successfully!',
    data: result,
  });
});
const getGiveawayPageData = catchAsync(async (req: Request, res: Response) => {
  const result = await GiveawayServices.getGiveawayPageDataFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Giveaway page data retrieved successfully',
    data: result,
  });
});

export const GiveawayControllers = {
  getAllGiveaways,
  getActiveGiveaway,
  getSingleGiveaway,
  createGiveaway,
  setGiveawayWinner,  
  updateGiveaway,
  deleteGiveaway,
  getGiveawayPageData
};