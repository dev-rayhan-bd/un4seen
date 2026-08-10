import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { Request, Response } from 'express';
import { MotivationalQuoteServices } from './motivationalQuote.services';

const createQuote = catchAsync(async (req: Request, res: Response) => {
  const result = await MotivationalQuoteServices.createQuoteInDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Motivational quote created successfully',
    data: result,
  });
});

const upsertBulkQuotes = catchAsync(async (req: Request, res: Response) => {
  // Assuming req.body is an array of quotes or { quotes: [...] }
  const payload = Array.isArray(req.body) ? req.body : req.body.quotes;
  
  const result = await MotivationalQuoteServices.upsertBulkQuotesInDB(payload);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Motivational quotes saved successfully',
    data: result,
  });
});

const getAllQuotes = catchAsync(async (req: Request, res: Response) => {
  const result = await MotivationalQuoteServices.getAllQuotesFromDB(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Motivational quotes retrieved successfully',
    data: result,
  });
});

const getTodayQuote = catchAsync(async (req: Request, res: Response) => {
  const result = await MotivationalQuoteServices.getTodayQuoteFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Today\'s quote retrieved successfully',
    data: result,
  });
});

const getQuoteById = catchAsync(async (req: Request, res: Response) => {
  const result = await MotivationalQuoteServices.getQuoteByIdFromDB(req.params.id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Motivational quote retrieved successfully',
    data: result,
  });
});

const updateQuote = catchAsync(async (req: Request, res: Response) => {
  const result = await MotivationalQuoteServices.updateQuoteInDB(req.params.id as string, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Motivational quote updated successfully',
    data: result,
  });
});

const deleteQuote = catchAsync(async (req: Request, res: Response) => {
  const result = await MotivationalQuoteServices.deleteQuoteFromDB(req.params.id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Motivational quote deleted successfully',
    data: result,
  });
});

export const MotivationalQuoteControllers = {
  createQuote,
  upsertBulkQuotes,
  getAllQuotes,
  getTodayQuote,
  getQuoteById,
  updateQuote,
  deleteQuote
};
