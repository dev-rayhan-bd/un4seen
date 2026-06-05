import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { UserServices } from './user.services';
import { Request, Response } from 'express';
import uploadImage from '../../middleware/upload';

const getMyProfile = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const result = await UserServices.getMyProfileFromDB(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User profile retrieved successfully',
    data: result,
  });
});

const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const payload = req.body;


  if (req.file) {
    const imageUrl = await uploadImage(req); 
    payload.image = imageUrl;
  }

  const result = await UserServices.updateProfileInDB(userId, payload);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result?.isProfileComplete 
      ? 'Profile completed! Welcome to the Syndicate.' 
      : 'Profile updated successfully.',
    data: result,
  });
});
const followUser = catchAsync(async (req: Request, res: Response) => {
  const { userId: followerId } = req.user;
  const { id: targetId } = req.params;

  const result = await UserServices.followUserInDB(followerId, targetId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: null,
  });
});

const unfollowUser = catchAsync(async (req: Request, res: Response) => {
  const { userId: followerId } = req.user;
  const { id: targetId } = req.params;

  const result = await UserServices.unfollowUserInDB(followerId, targetId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: null,
  });
});
const getSingleUser = catchAsync(async (req: Request, res: Response) => {
  const { id: targetId } = req.params;
  const { userId: currentUserId } = req.user;

  const result = await UserServices.getSingleUserFromDB(targetId as string, currentUserId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User profile retrieved successfully',
    data: result,
  });
});
const getFollowersList = catchAsync(async (req: Request, res: Response) => {
  const { id: userId } = req.params;
  const result = await UserServices.getFollowersListFromDB(userId as string, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Followers list retrieved',
    data: result,
  });
});

const getFollowingList = catchAsync(async (req: Request, res: Response) => {
  const { id: userId } = req.params;
  const result = await UserServices.getFollowingListFromDB(userId as string, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Following list retrieved',
    data: result,
  });
});
const getMyFollowers = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const result = await UserServices.getFollowersListFromDB(userId, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'My followers list retrieved',

    data: result,
  });
});


const getMyFollowing = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user; 
  const result = await UserServices.getFollowingListFromDB(userId, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'My following list retrieved',

    data: result,
  });
});
export const UserControllers = {
  getMyProfile,
  updateProfile,
  followUser,
  unfollowUser,
  getSingleUser,
  getFollowersList,
  getFollowingList,
  getMyFollowers,
  getMyFollowing
};