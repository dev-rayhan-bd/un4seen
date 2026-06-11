import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { CrewChoiceServices } from './crewChoice.services';
import httpStatus from 'http-status'
const createPoll = catchAsync(async (req: Request, res: Response) => {
  const result = await CrewChoiceServices.createPollInDB(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Poll created successfully!',
    data: result,
  });
});

const getPolls = catchAsync(async (req: Request, res: Response) => {
  const result = await CrewChoiceServices.getActivePollsFromDB(req.user.userId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Crew Choice polls retrieved',
    data: result,
  });
});

const votePoll = catchAsync(async (req: Request, res: Response) => {
  const { pollId, optionIndex } = req.body;
  const result = await CrewChoiceServices.castVoteInDB(req.user.userId, pollId, optionIndex);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Voted successfully!',
    data: result,
  });
});
const getPastPolls = catchAsync(async (req: Request, res: Response) => {
  const result = await CrewChoiceServices.getPastPollsFromDB(req.user.userId as string);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Past poll results retrieved successfully',
    data: result,
  });
});
export const CrewChoiceControllers = { createPoll, getPolls, votePoll,getPastPolls };