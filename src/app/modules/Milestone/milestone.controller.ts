import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { MilestoneServices } from './milestone.services';
import uploadImage from '../../middleware/upload';

const createMilestone = catchAsync(async (req: Request, res: Response) => {
  let data = req.body;
  if (req.body.data) data = JSON.parse(req.body.data);

  if (req.file) {
    const imageUrl = await uploadImage(req);
    data.image = imageUrl;
  }

  const result = await MilestoneServices.createMilestoneIntoDB(data);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Milestone reward created successfully',
    data: result,
  });
});

const getAllMilestones = catchAsync(async (req, res) => {
  const result = await MilestoneServices.getAllMilestonesFromDB(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Milestones retrieved successfully',
    data: result,
  });
});

const updateMilestone = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  let data = req.body;
  if (req.body.data) data = JSON.parse(req.body.data);

  if (req.file) {
    const imageUrl = await uploadImage(req);
    data.image = imageUrl;
  }

  const result = await MilestoneServices.updateMilestoneInDB(id as string, data);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Milestone updated successfully',
    data: result,
  });
});

const deleteMilestone = catchAsync(async (req, res) => {
  await MilestoneServices.deleteMilestoneFromDB(req.params.id as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Milestone deleted successfully',
    data: null,
  });
});

export const MilestoneControllers = {
  createMilestone,
  getAllMilestones,
  updateMilestone,
  deleteMilestone
};