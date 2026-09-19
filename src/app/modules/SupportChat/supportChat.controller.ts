import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import uploadImage from '../../middleware/upload';
import { SupportChatServices } from './supportChat.services';
import { getIO } from '../../utils/socket';

const sendMessage = catchAsync(async (req: Request, res: Response) => {
  const data = req.body;

  if (req.file) {
    const fileUrl = await uploadImage(req);
    data.file = fileUrl;
  }

  const result = await SupportChatServices.sendSupportMessageInDB(
    req.user.userId,
    req.user.role,
    data
  );

  try {
    const io = getIO();
    if (io) {
      const sessionIdStr = result.session._id.toString();
      const userIdStr = (result.session.user as any)?._id?.toString() || result.session.user.toString();

      // Emit to specific session room and user socket room
      io.to(sessionIdStr).emit('RECEIVE_SUPPORT_MESSAGE', result);
      io.to(userIdStr).emit('RECEIVE_SUPPORT_MESSAGE', result);

      // Emit alert to admins for new messages
      io.emit('NEW_SUPPORT_MESSAGE_ALERT', result);
    }
  } catch (error) {
    // socket error safety check
  }

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Support message sent successfully',
    data: result,
  });
});

const getMySupportChat = catchAsync(async (req: Request, res: Response) => {
  const session = await SupportChatServices.getOrCreateUserSupportSessionInDB(req.user.userId);
  const result = await SupportChatServices.getSupportMessagesFromDB(
    req.user.userId,
    req.user.role,
    session!._id.toString(),
    req.query
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Support chat history retrieved successfully',
    data: result,
  });
});

const getSessionMessages = catchAsync(async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const result = await SupportChatServices.getSupportMessagesFromDB(
    req.user.userId,
    req.user.role,
    sessionId as string,
    req.query
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Session message history retrieved successfully',
    data: result,
  });
});

const getAllSessionsForAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await SupportChatServices.getAllSupportSessionsForAdminFromDB(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'All support sessions retrieved successfully',
    data: result,
  });
});

const updateSessionStatus = catchAsync(async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const { status } = req.body;

  const result = await SupportChatServices.updateSupportSessionStatusInDB(
    sessionId as string,
    status,
    req.user.userId
  );

  try {
    const io = getIO();
    if (io) {
      io.to(sessionId as string).emit('SUPPORT_STATUS_CHANGED', result);
    }
  } catch (error) {
    // socket error safety check
  }

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Support session status updated successfully',
    data: result,
  });
});

export const SupportChatControllers = {
  sendMessage,
  getMySupportChat,
  getSessionMessages,
  getAllSessionsForAdmin,
  updateSessionStatus,
};
