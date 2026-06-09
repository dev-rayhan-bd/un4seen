import AppError from '../../errors/AppError';
import { Bike } from './bike.model';
import httpStatus from 'http-status';
import { TBike } from './bike.interface';
import { SavedBike } from './savedBike.model';

const addBikeToDB = async (userId: string, payload: Partial<TBike>) => {

  await Bike.updateMany({ user: userId, isRetired: false }, { isRetired: true });

  const result = await Bike.create({
    ...payload,
    user: userId,
    isRetired: false,
  });
  return result;
};

const getMyActiveBikeFromDB = async (userId: string) => {
  const bike = await Bike.findOne({ user: userId, isRetired: false });
  
  if (!bike) return null;


  const isSaved = await SavedBike.exists({ user: userId, bike: bike._id });

  return {
    ...bike.toObject(),
    isSaved: !!isSaved,
  };
};

const getRetiredBikesFromDB = async (userId: string) => {
  const bikes = await Bike.find({ user: userId, isRetired: true }).sort({ createdAt: -1 });


  const bikesWithSavedStatus = await Promise.all(
    bikes.map(async (bike) => {
      const isSaved = await SavedBike.exists({ user: userId, bike: bike._id });
      return {
        ...bike.toObject(),
        isSaved: !!isSaved,
      };
    })
  );

  return bikesWithSavedStatus;
};


const updateBikeInDB = async (bikeId: string, userId: string, payload: Partial<TBike>) => {
  const isBikeExist = await Bike.findOne({ _id: bikeId, user: userId });
  if (!isBikeExist) {
    throw new AppError(httpStatus.NOT_FOUND, 'Bike not found or unauthorized');
  }

  const result = await Bike.findByIdAndUpdate(
    bikeId,
    { $set: payload },
    { new: true, runValidators: true }
  );

  return result;
};
const toggleSaveBikeInDB = async (userId: string, bikeId: string) => {
  const alreadySaved = await SavedBike.findOne({ user: userId, bike: bikeId });

  if (alreadySaved) {

    await SavedBike.findByIdAndDelete(alreadySaved._id);
    return { isSaved: false, message: "Bike removed from saved list" };
  } else {

    await SavedBike.create({ user: userId, bike: bikeId });
    return { isSaved: true, message: "Bike saved to your profile" };
  }
};

const getBikeGalleryFromDB = async (bikeId: string) => {
  const bike = await Bike.findById(bikeId).select('gallery');
  if (!bike) throw new AppError(404, 'Bike not found');
  

  return (bike as any).gallery || []; 
};


const getSingleBikeFromDB = async (bikeId: string, currentUserId: string) => {
  const bike = await Bike.findById(bikeId).populate('user', 'firstName lastName image memberNumber');
  if (!bike) throw new AppError(404, 'Bike not found');


  const isSaved = await SavedBike.exists({ user: currentUserId, bike: bikeId });

  return {
    ...bike.toObject(),
    isSaved: !!isSaved, // true/false
  };
};

// (Save/Unsave)
const toggleFavoriteBikeInDB = async (userId: string, bikeId: string) => {
  const alreadySaved = await SavedBike.findOne({ user: userId, bike: bikeId });

  if (alreadySaved) {
    await SavedBike.findByIdAndDelete(alreadySaved._id);
    return { isSaved: false, message: "Removed from favorites" };
  } else {
    await SavedBike.create({ user: userId, bike: bikeId });
    return { isSaved: true, message: "Added to favorites" };
  }
};
const getMySavedBikesFromDB = async (userId: string) => {

  return await SavedBike.find({ user: userId }).populate({
    path: 'bike',
    populate: { path: 'user', select: 'firstName lastName image' }
  });
};

const addImagesToBikeGalleryInDB = async (bikeId: string, imageUrls: string[]) => {
  const result = await Bike.findByIdAndUpdate(
    bikeId,
    { 
      $push: { gallery: { $each: imageUrls } } 
    },
    { new: true }
  );
  
  if (!result) throw new AppError(404, 'Bike not found');
  return result;
};
const removeImagesFromGalleryInDB = async (
  bikeId: string, 
  userId: string, 
  imageUrls: string[]
) => {
 
  const result = await Bike.findOneAndUpdate(
    { _id: bikeId, user: userId },
    { 
      $pull: { gallery: { $in: imageUrls } }
    },
    { new: true }
  );

  if (!result) {
    throw new AppError(404, 'Bike not found or you are not authorized');
  }

  return result;
};
export const BikeServices = {
  addBikeToDB,
  getMyActiveBikeFromDB,
  getRetiredBikesFromDB,
  updateBikeInDB,
    toggleSaveBikeInDB,
    getBikeGalleryFromDB,
    getSingleBikeFromDB,
    toggleFavoriteBikeInDB,
    getMySavedBikesFromDB,
    addImagesToBikeGalleryInDB,
    removeImagesFromGalleryInDB,
};