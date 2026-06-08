import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { TestRiderServices } from "./testRider.services";
import httpStatus from "http-status";
import { Request, Response } from "express";
const submitApplication = catchAsync(async (req: Request, res: Response) => {
  const result = await TestRiderServices.applyForTestRider(req.user.userId, req.body.applicationText);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Application submitted successfully!',
    data: result,
  });
});

const getApplications = catchAsync(async (req: Request, res: Response) => {
  const result = await TestRiderServices.getAllApplicationsForAdmin();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Applications retrieved successfully',
    data: result,
  });
});
const reviewApplication = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'accepted'/ 'rejected'

  const result = await TestRiderServices.reviewApplicationInDB(id as string, status);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Application has been ${status} successfully.`,
    data: result,
  });
});
export const TestRiderController = {
  submitApplication,
  getApplications,
  reviewApplication,
};
