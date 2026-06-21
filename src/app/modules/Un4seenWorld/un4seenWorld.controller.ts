import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import uploadImage from '../../middleware/upload';
import { Un4seenWorldServices } from './un4seenWorld.services';

const createBrand = catchAsync(async (req: Request, res: Response) => {
  let data = req.body;
  if (req.body.data) data = JSON.parse(req.body.data);

  if (req.file) {
    data.image = await uploadImage(req);
  }

  const result = await Un4seenWorldServices.createBrandInDB(data);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Brand added to Un4seen World!',
    data: result,
  });
});

const getAllBrands = catchAsync(async (req, res) => {
  const result = await Un4seenWorldServices.getAllBrandsFromDB(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Brands retrieved successfully',
    data: result,
  });
});

const updateBrand = catchAsync(async (req, res) => {
  let data = req.body;
  if (req.body.data) data = JSON.parse(req.body.data);
  if (req.file) data.image = await uploadImage(req);

  const result = await Un4seenWorldServices.updateBrandInDB(req.params.id as string, data);
  sendResponse(res, { statusCode: 200, success: true, message: 'Brand updated', data: result });
});

const deleteBrand = catchAsync(async (req, res) => {
  await Un4seenWorldServices.deleteBrandFromDB(req.params.id as string);
  sendResponse(res, { statusCode: 200, success: true, message: 'Brand removed', data: null });
});

export const Un4seenWorldControllers = { createBrand, getAllBrands, updateBrand, deleteBrand };