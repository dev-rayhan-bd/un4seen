import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import uploadImage from '../../middleware/upload';
import { ProductServices } from './product.services';

const createProduct = catchAsync(async (req: Request, res: Response) => {
  let productData = req.body;
  if (req.body.data) productData = JSON.parse(req.body.data);

  if (req.file) {
    const imageUrl = await uploadImage(req);
    productData.image = imageUrl;
  }

  const result = await ProductServices.createProductIntoDB(productData);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Product added to store successfully',
    data: result,
  });
});

const getProducts = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductServices.getAllProductsFromDB(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Products retrieved successfully',
    data: result,
  });
});

export const ProductControllers = { createProduct, getProducts };