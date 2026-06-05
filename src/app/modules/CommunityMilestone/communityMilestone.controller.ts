import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';

import uploadImage from '../../middleware/upload';
import { CommunityMilestoneServices } from './communityMilestone.services';
import AppError from '../../errors/AppError';

const createMilestone = catchAsync(async (req: Request, res: Response) => {
 
  const milestoneData = req.body; 

  if (req.file) {
    const imageUrl = await uploadImage(req);
    milestoneData.image = imageUrl;
  } else {
    throw new AppError(httpStatus.BAD_REQUEST, "Milestone image is required");
  }

  const result = await CommunityMilestoneServices.createMilestoneIntoDB(milestoneData);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Community milestone created successfully',
    data: result,
  });
});

const getAllMilestones = catchAsync(async (req: Request, res: Response) => {
  const result = await CommunityMilestoneServices.getAllMilestonesFromDB();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Milestones retrieved successfully',
    data: result,
  });
});

const updateMilestone = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;


  if (req.file) {
    const imageUrl = await uploadImage(req);
    updateData.image = imageUrl;
  }

  const result = await CommunityMilestoneServices.updateMilestoneInDB(id as string, updateData);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Community milestone updated successfully',
    data: result,
  });
});


const deleteMilestone = catchAsync(async (req: Request, res: Response) => {
  await CommunityMilestoneServices.deleteMilestoneFromDB(req.params.id as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Milestone deleted successfully',
    data: null,
  });
});
const claimMilestone = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params; // milestone id
  const result = await CommunityMilestoneServices.claimMilestoneInDB(req.user.userId, id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reward claimed successfully! Admin will process your gift.',
    data: result,
  });
});


export const CommunityMilestoneControllers = {
  createMilestone,
  getAllMilestones,
  updateMilestone,
  deleteMilestone,
  claimMilestone
};