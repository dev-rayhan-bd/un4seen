import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { PointServices } from './points.services';
import AppError from '../../errors/AppError';
import uploadImage from '../../middleware/upload';


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
const getReferralStats = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const result = await PointServices.getReferralStats(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Referral statistics retrieved successfully',
    data: result,
  });
});
const submitProof = catchAsync(async (req: Request, res: Response) => {
    if (!req.file) throw new AppError(httpStatus.BAD_REQUEST, "Proof screenshot is required");
    const imageUrl = await uploadImage(req);
    
    const data = req.body.data ? JSON.parse(req.body.data) : req.body;
    const result = await PointServices.submitSocialProof(req.user.userId, {
        ...data,
        proofImage: imageUrl
    });

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Proof submitted! Points will be awarded after admin review.',
        data: result,
    });
});


const adminReview = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, adminComment } = req.body;
    const result = await PointServices.reviewSubmission(id as string, status, adminComment);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: `Submission ${status} successfully`,
        data: result,
    });
});
const getPendingSubmissions = catchAsync(async (req: Request, res: Response) => {
    const result = await PointServices.getAllPendingSubmissions(req.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Pending submissions retrieved successfully',
        data: result,
    });
});

const adminUpdateUserPoints = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params; // userId
    const { action, points, description } = req.body;
    
    if (!['add', 'deduct', 'set'].includes(action)) {
        throw new AppError(httpStatus.BAD_REQUEST, "Invalid action. Must be 'add', 'deduct', or 'set'");
    }
    
    if (typeof points !== 'number' || points < 0) {
        throw new AppError(httpStatus.BAD_REQUEST, "Points must be a positive number");
    }

    const result = await PointServices.adminUpdateUserPoints(id as string, { action, points, description });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: `User points successfully ${action}ed`,
        data: result,
    });
});

const getMyRedeemedCodes = catchAsync(async (req, res) => {
  const result = await PointServices.getMyRedeemedCodesFromDB(req.user.userId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Redeemed codes retrieved successfully',
    data: result,
  });
});


export const PointControllers = { claimDaily, redeem, socialShare, getMyHistory, getDashboard, claimMilestone, claimProfileBonus ,applyReferral, getReferralStats, submitProof, adminReview, getPendingSubmissions,getMyRedeemedCodes, adminUpdateUserPoints };