import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { PointSettingsServices } from './pointSettings.services';

const getSettings = catchAsync(async (req: Request, res: Response) => {
  const result = await PointSettingsServices.getPointSettingsFromDB();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Point settings retrieved successfully',
    data: result,
  });
});

const updateSettings = catchAsync(async (req: Request, res: Response) => {
  const result = await PointSettingsServices.updatePointSettingsInDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Point settings updated successfully',
    data: result,
  });
});

export const PointSettingsControllers = { getSettings, updateSettings };