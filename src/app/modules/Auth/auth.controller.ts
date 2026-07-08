import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AuthServices } from './auth.services';
import { Request, Response } from 'express';

const login = catchAsync(async (req, res) => {
  const result = await AuthServices.loginUser(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Login successful',
    data: {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken, 
      user: result.user,
    },
  });
});

const shopifyWebhook = catchAsync(async (req, res) => {
  const result = await AuthServices.registerFromShopify(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User synced successfully',
    data: result,
  });
});
const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;
  await AuthServices.forgotPassword(email);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'OTP sent to your email. Please check your inbox.',
    data: null,
  });
});

const resendOTP = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;
  await AuthServices.resendOTP(email);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'A new OTP has been sent to your email.',
    data: null,
  });
});

const verifyOTP = catchAsync(async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  const result = await AuthServices.verifyOTP(email, otp);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'OTP verified successfully.',
    data: result,
  });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  await AuthServices.resetPassword(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password reset successful. You can now login with your new password.',
    data: null,
  });
});

const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.body; 
  const result = await AuthServices.refreshToken(refreshToken);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Access token retrieved successfully',
    data: result,
  });
});
const changePassword = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user; 
  const passwordData = req.body;

  await AuthServices.changePassword(userId, passwordData);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password changed successfully!',
    data: null,
  });
});

const logout = catchAsync(async (req: Request, res: Response) => {
  await AuthServices.logoutUser(req.user.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Logged out successfully',
    data: null,
  });
});

export const AuthControllers = { login, shopifyWebhook, forgotPassword, resendOTP, verifyOTP, resetPassword,refreshToken ,changePassword, logout};