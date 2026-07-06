import { Request, Response } from 'express';
import httpStatus from 'http-status';

import { NotificationServices } from './notification.services';
import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';
import AppError from '../../../errors/AppError';

const getMyNotifications = catchAsync(async (req: Request, res: Response) => {
  const result = await NotificationServices.getMyNotificationsFromDB(req.user.userId, req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Notifications retrieved successfully',
    data: result,
  });
});

const markAllAsRead = catchAsync(async (req: Request, res: Response) => {
  await NotificationServices.markAllAsReadInDB(req.user.userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All notifications marked as read',
    data: null,
  });
});

const markSingleAsRead = catchAsync(async (req: Request, res: Response) => {
  const result = await NotificationServices.markSingleAsReadInDB(req.user.userId, req.params.id as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Notification marked as read',
    data: result,
  });
});

const testNotification = catchAsync(async (req: Request, res: Response) => {
  const token = req.query.token as string;
  if (!token) {
    throw new AppError(httpStatus.BAD_REQUEST, 'FCM token is required as query param');
  }

  const admin = require('firebase-admin');
  const payload = {
    notification: {
      title: 'Test Notification 🎉',
      body: 'If you see this, push notifications are working!',
    },
    token,
  };

  const response = await admin.messaging().send(payload);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Test notification sent successfully',
    data: { messageId: response },
  });
});

export const NotificationControllers = {
  getMyNotifications,
  markAllAsRead,
  markSingleAsRead,
  testNotification
};