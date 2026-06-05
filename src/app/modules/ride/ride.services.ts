import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { Ride } from './ride.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { PointServices } from '../ShredPoints/points.services';
import { sendNotification } from '../../utils/sendNotification';
import { TRide } from './ride.interface';

const createRideInDB = async (payload: Partial<TRide>) => {
  const result = await Ride.create(payload);
  
  
  await PointServices.addPoints(payload.user!.toString(), 'social_share' as any, 50);
  
  return result;
};

const getAllRidesFromDB = async (query: Record<string, unknown>, currentUserId?: string) => {
  const rideQuery = new QueryBuilder(
    Ride.find({ isDeleted: false }).populate('user', 'firstName lastName image memberNumber status'), 
    query
  )
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await rideQuery.modelQuery;
  const meta = await rideQuery.countTotal();

  
  const modifiedResult = result.map((ride) => {
    const rideObj = ride.toObject();
    return {
      ...rideObj,
      isHearted: currentUserId 
        ? ride.hearts.some((id) => id.toString() === currentUserId.toString()) 
        : false,
    };
  });

  return { meta, result: modifiedResult };
};

const toggleHeartInDB = async (userId: string, rideId: string) => {
  const ride = await Ride.findById(rideId);
  if (!ride) throw new AppError(httpStatus.NOT_FOUND, 'Ride not found');

  const isHearted = ride.hearts.includes(userId as any);

  if (isHearted) {
    // (Remove Like)
    await Ride.findByIdAndUpdate(rideId, {
      $pull: { hearts: userId },
      $inc: { heartCount: -1 }
    });
  } else {
    // (Add Like)
    await Ride.findByIdAndUpdate(rideId, {
      $addToSet: { hearts: userId },
      $inc: { heartCount: 1 }
    });
    
  
    await sendNotification(
      ride.user.toString(),
      'New Heart! ❤️',
      'Someone loves your ride setup!',
      'general'
    );
  }

  return { isHearted: !isHearted };
};

const getLeaderboardFromDB = async () => {
//last 7 days top 10 rides based on heart count, excluding deleted rides
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);

  return await Ride.find({ 
    createdAt: { $gte: lastWeek },
    isDeleted: false 
  })
    .sort({ heartCount: -1 })
    .limit(10)
    .populate('user', 'firstName lastName image memberNumber');
};
const setBikeOfTheWeekInDB = async (rideId: string) => {
  const ride = await Ride.findById(rideId);
  if (!ride) throw new AppError(httpStatus.NOT_FOUND, 'Ride not found');

  await Ride.updateMany({ isBikeOfTheWeek: true }, { isBikeOfTheWeek: false });

  ride.isBikeOfTheWeek = true;
  await ride.save();

  // Add points to the user for winning bike of the week
  await PointServices.addPoints(ride.user.toString(), 'bike_winner' as any, 500);
  return ride;
};
export const RideServices = {
  createRideInDB,
  getAllRidesFromDB,
  toggleHeartInDB,
  getLeaderboardFromDB,
    setBikeOfTheWeekInDB
};