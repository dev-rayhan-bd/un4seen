import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { UserServices } from './user.services';
import { Request, Response } from 'express';
import uploadImage from '../../middleware/upload';

const getMyProfile = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const result = await UserServices.getCompleteProfileData(userId as string, userId as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'My profile retrieved successfully',
    data: result,
  });
});

const getAllMembers = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.getAllUsersFromDB(req.query, req.user.userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Members retrieved successfully',
    data: result,
  });
});

const getSingleUser = catchAsync(async (req, res) => {
  const targetId = req.params.id;
  const viewerId = req.user.userId;
  const result = await UserServices.getCompleteProfileData(targetId as string, viewerId as string);

  sendResponse(res, {
    statusCode: 200,
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

  const result = await UserServices.updateProfileInDB(userId as string, payload);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result?.isProfileComplete 
      ? 'Your Syndicate profile has been updated' 
      : 'Try Again',
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
const getHomePageData = catchAsync(async (req, res) => {
  const result = await UserServices.getHomePageDataFromDB(req.user.userId);
  
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Home page data retrieved successfully',
    data: result,
  });
});
const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body; 

  const result = await UserServices.updateUserStatusInDB(id as string, status);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `User has been ${status} successfully`,
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
  getMyFollowing,
  getHomePageData,
  getAllMembers,updateUserStatus
};