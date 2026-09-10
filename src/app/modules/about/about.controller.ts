import { Request, Response } from 'express';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import About from './about.model';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';

// Controller to create or update About Us content
const createOrUpdateAbout = catchAsync(async (req: Request, res: Response) => {
  const { aboutUs } = req.body;

  const existingAbout = await About.findOne();

  if (existingAbout) {
    const updatedAbout = await About.findByIdAndUpdate(
      existingAbout._id,
      { aboutUs },
      { new: true, runValidators: true },
    );

    if (!updatedAbout) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update About Us');
    }

    return sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'About Us updated successfully',
      data: updatedAbout,
    });
  } else {
    const newAbout = await About.create({ aboutUs });

    if (!newAbout) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create About Us');
    }

    return sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'About Us created successfully',
      data: newAbout,
    });
  }
});

// Controller to get About Us content
const getAbout = catchAsync(async (req: Request, res: Response) => {
  const about = await About.findOne();

  if (!about) {
    throw new AppError(httpStatus.NOT_FOUND, 'No About Us found!');
  }

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'About Us retrieved successfully',
    data: about,
  });
});

export default {
  createOrUpdateAbout,
  getAbout,
};