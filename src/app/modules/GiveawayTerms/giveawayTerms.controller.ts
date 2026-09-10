import { Request, Response } from 'express';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import GiveawayTerms from './giveawayTerms.model';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';

// Controller to create or update Giveaway Terms & Eligibility content
const createOrUpdateGiveawayTerms = catchAsync(async (req: Request, res: Response) => {
  const { giveawayTerms } = req.body;

  const existingTerms = await GiveawayTerms.findOne();

  if (existingTerms) {
    const updatedTerms = await GiveawayTerms.findByIdAndUpdate(
      existingTerms._id,
      { giveawayTerms },
      { new: true, runValidators: true },
    );

    if (!updatedTerms) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update Giveaway Terms');
    }

    return sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Giveaway Terms updated successfully',
      data: updatedTerms,
    });
  } else {
    const newTerms = await GiveawayTerms.create({ giveawayTerms });

    if (!newTerms) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create Giveaway Terms');
    }

    return sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Giveaway Terms created successfully',
      data: newTerms,
    });
  }
});

// Controller to get Giveaway Terms content
const getGiveawayTerms = catchAsync(async (req: Request, res: Response) => {
  const giveawayTerms = await GiveawayTerms.findOne();

  if (!giveawayTerms) {
    throw new AppError(httpStatus.NOT_FOUND, 'No Giveaway Terms found!');
  }

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Giveaway Terms retrieved successfully',
    data: giveawayTerms,
  });
});

export default {
  createOrUpdateGiveawayTerms,
  getGiveawayTerms,
};
