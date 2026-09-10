import { Request, Response } from 'express';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import SyndicateTerms from './syndicateTerms.model';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';

// Controller to create or update Syndicate Terms & Conditions content
const createOrUpdateSyndicateTerms = catchAsync(async (req: Request, res: Response) => {
  const { syndicateTerms } = req.body;

  const existingTerms = await SyndicateTerms.findOne();

  if (existingTerms) {
    const updatedTerms = await SyndicateTerms.findByIdAndUpdate(
      existingTerms._id,
      { syndicateTerms },
      { new: true, runValidators: true },
    );

    if (!updatedTerms) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update Syndicate Terms');
    }

    return sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Syndicate Terms updated successfully',
      data: updatedTerms,
    });
  } else {
    const newTerms = await SyndicateTerms.create({ syndicateTerms });

    if (!newTerms) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create Syndicate Terms');
    }

    return sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Syndicate Terms created successfully',
      data: newTerms,
    });
  }
});

// Controller to get Syndicate Terms content
const getSyndicateTerms = catchAsync(async (req: Request, res: Response) => {
  const syndicateTerms = await SyndicateTerms.findOne();

  if (!syndicateTerms) {
    throw new AppError(httpStatus.NOT_FOUND, 'No Syndicate Terms found!');
  }

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Syndicate Terms retrieved successfully',
    data: syndicateTerms,
  });
});

export default {
  createOrUpdateSyndicateTerms,
  getSyndicateTerms,
};
