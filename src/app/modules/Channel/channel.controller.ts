import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ChannelServices } from './channel.services';
import AppError from '../../errors/AppError';
import uploadImage from '../../middleware/upload';

const startPrivateChat = catchAsync(async (req: Request, res: Response) => {
  const result = await ChannelServices.getOrCreatePrivateChatInDB(req.user.userId, req.body.targetId);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: 'Chat ready', data: result });
});

const createGroup = catchAsync(async (req: Request, res: Response) => {
  const result = await ChannelServices.createGroupInDB(req.user.userId, req.body);
  sendResponse(res, { statusCode: httpStatus.CREATED, success: true, message: 'Group created', data: result });
});

const getMyChats = catchAsync(async (req: Request, res: Response) => {
  const result = await ChannelServices.getMyChatListFromDB(req.user.userId);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: 'Chat list retrieved', data: result });
});

const getMessages = catchAsync(async (req: Request, res: Response) => {
  const result = await ChannelServices.getMessagesFromDB(req.params.id as string, req.query);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: 'Messages retrieved',data: result });
});

const reportMessage = catchAsync(async (req: Request, res: Response) => {
  const result = await ChannelServices.reportMessageInDB(req.user.userId, req.body);
  sendResponse(res, { statusCode: httpStatus.CREATED, success: true, message: 'Report submitted', data: result });
});

const uploadAttachment = catchAsync(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new AppError(httpStatus.BAD_REQUEST, "No file uploaded");
  }

  const fileUrl = await uploadImage(req);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'File uploaded successfully',
    data: fileUrl,
  });
});
const searchChannels = catchAsync(async (req, res) => {
  const result = await ChannelServices.searchAllChannelsFromDB(req.user.userId, req.query.searchTerm as string);
  sendResponse(res, { statusCode: 200, success: true, message: 'Channels found', data: result });
});

const requestToJoin = catchAsync(async (req, res) => {
  const result = await ChannelServices.sendJoinRequestInDB(req.user.userId, req.body.channelId);
  sendResponse(res, { statusCode: 201, success: true, message: 'Join request sent to admin', data: result });
});
const getMyJoinedChannels = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const result = await ChannelServices.getMyJoinedChannelsFromDB(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Joined channels retrieved successfully',
    data: result,
  });
});
const getJoinRequests = catchAsync(async (req, res) => {
  const result = await ChannelServices.getChannelRequestsFromDB(req.user.userId as string, req.params.channelId as string);
  sendResponse(res, { statusCode: 200, success: true, message: 'Pending requests retrieved', data: result });
});

const actionOnRequest = catchAsync(async (req, res) => {
  const { requestId, status } = req.body;
  const result = await ChannelServices.handleJoinRequestInDB(req.user.userId, requestId, status);
  sendResponse(res, { statusCode: 200, success: true, message: `Request ${status} successfully`, data: result });
});
const searchRiders = catchAsync(async (req: Request, res: Response) => {

  const { searchTerm } = req.query; 

  const result = await ChannelServices.searchRidersFromDB(
    searchTerm as string, 
    req.user.userId
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Riders retrieved successfully',
    data: result,
  });
});
const getPrivateHistory = catchAsync(async (req: Request, res: Response) => {
  const { otherUserId } = req.params;
  const { userId } = req.user;

  const result = await ChannelServices.getPrivateChatHistoryFromDB(userId, otherUserId as string, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Private chat history retrieved',
    data: result,
  });
});
const getChannelMembers = catchAsync(async (req, res) => {
  const result = await ChannelServices.getChannelMembersFromDB(req.params.id as string);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Channel members retrieved successfully',
    data: result,
  });
});
export const ChannelControllers = { 
  startPrivateChat, 
  createGroup, 
  getMyChats, 
  getMessages,
  reportMessage ,
  uploadAttachment,
  searchChannels,
  requestToJoin,
  getMyJoinedChannels,
  getJoinRequests,
  actionOnRequest,searchRiders,
  getPrivateHistory,
  getChannelMembers
  
};