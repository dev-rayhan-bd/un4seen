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
export const ChannelControllers = { 
  startPrivateChat, 
  createGroup, 
  getMyChats, 
  getMessages,
  reportMessage ,
  uploadAttachment
};