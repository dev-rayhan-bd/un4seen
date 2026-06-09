import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { IdeaServices } from './idea.services';

const submitIdea = catchAsync(async (req, res) => {
  const result = await IdeaServices.createIdeaInDB(req.user.userId, req.body);
  sendResponse(res, { statusCode: 201, success: true, message: 'Idea submitted for review!', data: result });
});

const getIdeas = catchAsync(async (req, res) => {
  const result = await IdeaServices.getAllActiveIdeasFromDB(req.query, req.user.userId);
  sendResponse(res, { statusCode: 200, success: true, message: 'Ideas retrieved', data: result });
});

const toggleUpvote = catchAsync(async (req, res) => {
  const result = await IdeaServices.toggleUpvoteInDB(req.user.userId, req.params.id as string);
  sendResponse(res, { statusCode: 200, success: true, message: 'Vote updated', data: result });
});

const adminApproveIdea = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const result = await IdeaServices.updateIdeaStatusInDB(id as string, status);
  sendResponse(res, { statusCode: 200, success: true, message: `Idea ${status}`, data: result });
});
const getCategories = catchAsync(async (req, res) => {
  const result = IdeaServices.getIdeaCategoriesFromDB();
  
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Idea categories retrieved successfully',
    data: result,
  });
});
export const IdeaControllers = { submitIdea, getIdeas, toggleUpvote, adminApproveIdea,getCategories };