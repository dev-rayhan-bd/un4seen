import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { PointServices } from './points.services';

const claimDaily = catchAsync(async (req: Request, res: Response) => {
  const result = await PointServices.claimDailyPoints(req.user.userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Daily reward collected!',
    data: { newBalance: result },
  });
});

const redeem = catchAsync(async (req: Request, res: Response) => {
  const result = await PointServices.redeemPoints(req.user.userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Shopify code generated!',
    data: result,
  });
});

const socialShare = catchAsync(async (req: Request, res: Response) => {
  const { platform } = req.body; // e.g. facebook, instagram
  const result = await PointServices.handleSocialShare(req.user.userId, platform);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Points added for sharing on ${platform}`,
    data: { newBalance: result },
  });
});
const getMyHistory = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  
  const result = await PointServices.getMyPointHistoryFromDB(userId, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Point history retrieved successfully',

    data: result.result,
  });
});
const getDashboard = catchAsync(async (req: Request, res: Response) => {
  const result = await PointServices.getShredPointsDashboard(req.user.userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Dashboard data retrieved successfully',
    data: result,
  });
});

const claimMilestone = catchAsync(async (req: Request, res: Response) => {
  const { milestoneId } = req.body;
  const result = await PointServices.claimMilestoneReward(req.user.userId, milestoneId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reward claimed! Admin will process your shipment.',
    data: result,
  });
});
const claimProfileBonus = catchAsync(async (req: Request, res: Response) => {
  const result = await PointServices.claimProfileCompletionPoints(req.user.userId);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Profile completion bonus added to your account!',
    data: result,
  });
});
const applyReferral = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const { code } = req.body;

  const result = await PointServices.applyReferralCode(userId, code);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: null,
  });
});

export const PointControllers = { claimDaily, redeem, socialShare, getMyHistory, getDashboard, claimMilestone, claimProfileBonus ,applyReferral};