import { Request, Response } from 'express';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import Terms from './terms.model';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';

// Controller to create or update Terms & Conditions content
const createOrUpdateTerms = catchAsync(async (req: Request, res: Response) => {
  const { termsCondition } = req.body;

  const existingTerms = await Terms.findOne();

  if (existingTerms) {
    const updatedTerms = await Terms.findByIdAndUpdate(
      existingTerms._id,
      { termsCondition },
      { new: true, runValidators: true },
    );

    if (!updatedTerms) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update Terms and Conditions');
    }

    return sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Terms & Conditions updated successfully',
      data: updatedTerms,
    });
  } else {
    const newTerms = await Terms.create({ termsCondition });

    if (!newTerms) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create Terms and Conditions');
    }

    return sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Terms & Conditions created successfully',
      data: newTerms,
    });
  }
});

// Controller to get Terms & Conditions content
const getTerms = catchAsync(async (req: Request, res: Response) => {
  const terms = await Terms.findOne();

  if (!terms) {
    throw new AppError(httpStatus.NOT_FOUND, 'No Terms found!');
  }

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Terms retrieved successfully',
    data: terms,
  });
});

export default {
  createOrUpdateTerms,
  getTerms,
};