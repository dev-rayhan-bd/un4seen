import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import uploadImage from '../../middleware/upload';
import { BikeServices } from './bike.services';
import AppError from '../../errors/AppError';

const addBike = catchAsync(async (req: Request, res: Response) => {
  const data = req.body.data ? JSON.parse(req.body.data) : req.body;

  if (req.file) {
    const imageUrl = await uploadImage(req);
    data.image = imageUrl;
  }

  const result = await BikeServices.addBikeToDB(req.user.userId as string, data);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'New bike added! Previous bike moved to retired.',
    data: result,
  });
});

const getUserBikeProfile = catchAsync(async (req, res) => {

  const targetUserId = (req.params.id as string) || (req.user.userId as string);
  

  const viewerId = req.user.userId;

  const activeBike = await BikeServices.getMyActiveBikeFromDB(targetUserId, viewerId);
  const retiredBikes = await BikeServices.getRetiredBikesFromDB(targetUserId, viewerId as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Bike profile retrieved successfully',
    data: { activeBike, retiredBikes },
  });
});
const updateBike = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId } = req.user;
  
  let updateData = req.body;


  if (req.body.data) {
    updateData = JSON.parse(req.body.data);
  }

  if (req.file) {
    const imageUrl = await uploadImage(req);
    updateData.image = imageUrl;
  }

  const result = await BikeServices.updateBikeInDB(id as string, userId, updateData);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Bike profile updated successfully!',
    data: result,
  });
});
const toggleSaveBike = catchAsync(async (req, res) => {
  const result = await BikeServices.toggleSaveBikeInDB(req.user.userId as string, req.params.id as string);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.message,
    data: result,
  });
});

const getSavedBikes = catchAsync(async (req, res) => {
  const result = await BikeServices.getMySavedBikesFromDB(req.user.userId as string);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Saved bikes retrieved',
    data: result,
  });
});
const getBikeGallery = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await BikeServices.getBikeGalleryFromDB(id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Bike gallery retrieved successfully',
    data: result,
  });
});

const getSingleBike = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await BikeServices.getSingleBikeFromDB(id as string, req.user.userId as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Bike details retrieved',
    data: result,
  });
});
const uploadToGallery = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    throw new AppError(400, "Please select at least one image to upload");
  }


  const uploadPromises = files.map((file) => uploadImage(req, file));
  const imageUrls = await Promise.all(uploadPromises);

  const result = await BikeServices.addImagesToBikeGalleryInDB(id as string, imageUrls);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Gallery updated successfully!',
    data: result,
  });
});
const deleteGalleryImages = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { imageUrls } = req.body;  ['url1', 'url2']

  if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
    throw new AppError(400, "Please provide an array of image URLs to delete");
  }

  const result = await BikeServices.removeImagesFromGalleryInDB(
    id as string, 
    req.user.userId as string, 
    imageUrls
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Images removed from gallery successfully',
    data: result,
  });
});


export const BikeControllers = { addBike, getUserBikeProfile, updateBike, toggleSaveBike, getSavedBikes, getBikeGallery, getSingleBike, uploadToGallery, deleteGalleryImages };