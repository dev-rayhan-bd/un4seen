import { Request, Response } from 'express';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import PrivacyPolicy from './privacyPolicy.model';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';

// Controller to create or update Privacy Policy content
const createOrUpdatePrivacyPolicy = catchAsync(async (req: Request, res: Response) => {
  const { privacyPolicy } = req.body;

  const existingPrivacyPolicy = await PrivacyPolicy.findOne();

  if (existingPrivacyPolicy) {
    const updatedPrivacyPolicy = await PrivacyPolicy.findByIdAndUpdate(
      existingPrivacyPolicy._id,
      { privacyPolicy },
      { new: true, runValidators: true },
    );

    if (!updatedPrivacyPolicy) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update Privacy Policy');
    }

    return sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Privacy Policy updated successfully',
      data: updatedPrivacyPolicy,
    });
  } else {
    const newPrivacyPolicy = await PrivacyPolicy.create({ privacyPolicy });

    if (!newPrivacyPolicy) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create Privacy Policy');
    }

    return sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Privacy Policy created successfully',
      data: newPrivacyPolicy,
    });
  }
});

// Controller to get Privacy Policy content
const getPrivacyPolicy = catchAsync(async (req: Request, res: Response) => {
  const privacyPolicy = await PrivacyPolicy.findOne();

  if (!privacyPolicy) {
    throw new AppError(httpStatus.NOT_FOUND, 'No Privacy Policy found!');
  }

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Privacy Policy retrieved successfully',
    data: privacyPolicy,
  });
});

export default {
  createOrUpdatePrivacyPolicy,
  getPrivacyPolicy,
};