import httpStatus from 'http-status';
import { Types } from 'mongoose';
import AppError from '../../errors/AppError';
import { Ride } from './ride.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { PointServices } from '../ShredPoints/points.services';
import { sendNotification } from '../../utils/sendNotification';
import { TRide } from './ride.interface';

// const createRideInDB = async (payload: Partial<TRide>) => {
//   const result = await Ride.create(payload);

//   await PointServices.addPoints(payload.user!.toString(), 'social_share' as any, 50);
//   return result;
// };
const createRideInDB = async (payload: Partial<TRide>) => {

  const existingRide = await Ride.findOne({ 
    user: payload.user, 
    isDeleted: false 
  });

  if (existingRide) {
    throw new AppError(
      httpStatus.BAD_REQUEST, 
      "You already have an active ride. Please delete the current one to upload a new ride."
    );
  }


  const result = await Ride.create(payload);


  await PointServices.addPoints(payload.user!.toString(), 'social_share' as any, 50);
  
  return result;
};
const getAllRidesFromDB = async (query: Record<string, unknown>, currentUserId?: string) => {
  const rideQuery = new QueryBuilder(
    Ride.find({ isDeleted: false }).populate('user', 'firstName lastName image memberNumber status country'), 
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
    const myVote = ride.votes.find(v => v.user.toString() === currentUserId?.toString());
    
    return {
      ...rideObj,
      isVoted: !!myVote,
      myRating: myVote ? myVote.rating : 0, 
      votes: undefined 
    };
  });

  return { meta, result: modifiedResult };
};

const voteRideInDB = async (userId: string, rideId: string, rating: number) => {
  const ride = await Ride.findById(rideId);
  if (!ride) throw new AppError(httpStatus.NOT_FOUND, 'Ride not found');

  const existingVoteIndex = ride.votes.findIndex(v => v.user.toString() === userId);

  if (existingVoteIndex > -1) {

    ride.votes[existingVoteIndex].rating = rating;
  } else {

    ride.votes.push({ user: new Types.ObjectId(userId), rating });
    ride.flameCount += 1;
  }


  const totalRating = ride.votes.reduce((sum, v) => sum + v.rating, 0);
  ride.averageRating = Number((totalRating / ride.votes.length).toFixed(1));

  await ride.save();
  return ride;
};
const removeVoteFromRideInDB = async (userId: string, rideId: string) => {
  const ride = await Ride.findById(rideId);
  if (!ride) throw new AppError(404, 'Ride not found');


  const hasVoted = ride.votes.some(v => v.user.toString() === userId);
  if (!hasVoted) {
    throw new AppError(400, 'You haven’t voted for this bike yet');
  }


  await Ride.findByIdAndUpdate(rideId, {
    $pull: { votes: { user: userId } },
    $inc: { flameCount: -1 } 
  });


  const updatedRide = await Ride.findById(rideId);
  if (updatedRide!.votes.length > 0) {
    const totalRating = updatedRide!.votes.reduce((sum, v) => sum + v.rating, 0);
    updatedRide!.averageRating = Number((totalRating / updatedRide!.votes.length).toFixed(1));
  } else {
    updatedRide!.averageRating = 0; 
  }

  await updatedRide!.save();
  return { message: "Vote removed successfully" };
};
const getLeaderboardFromDB = async () => {
 return await Ride.find({ isDeleted: false })
    .sort({ averageRating: -1, flameCount: -1 })
    .limit(10)
    .populate('user', 'firstName lastName image memberNumber');
};

const setBikeOfTheWeekInDB = async (rideId: string) => {
  const ride = await Ride.findById(rideId).populate('user');
  if (!ride) throw new AppError(httpStatus.NOT_FOUND, 'Ride not found');

  await Ride.updateMany({ isBikeOfTheWeek: true }, { isBikeOfTheWeek: false });

  ride.isBikeOfTheWeek = true;
  await ride.save();

  //500 Shred Points 
  await PointServices.addPoints(ride.user._id.toString(), 'bike_winner' as any, 500);

  await sendNotification(
    ride.user._id.toString(),
    '🏆 Bike of the Week Winner!',
    'Your ride was selected as the Bike of the Week! You earned 500 Shred Points.',
    'promo'
  );

  return ride;
};
const deleteMyRideFromDB = async (userId: string, rideId: string) => {
  const result = await Ride.findOneAndUpdate(
    { _id: rideId, user: userId },
    { isDeleted: true },
    { new: true }
  );

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Ride not found or you are not authorized to delete this.");
  }

  return result;
};

export const RideServices = {
  createRideInDB,
  getAllRidesFromDB,
  voteRideInDB,
  removeVoteFromRideInDB,
  getLeaderboardFromDB,
  setBikeOfTheWeekInDB,deleteMyRideFromDB
};