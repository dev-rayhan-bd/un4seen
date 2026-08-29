import moment from 'moment';
import httpStatus from 'http-status';
import { Types } from 'mongoose';
import AppError from '../../errors/AppError';
import { Ride } from './ride.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { PointServices } from '../ShredPoints/points.services';
import { sendNotification } from '../../utils/sendNotification';
import { TRide } from './ride.interface';

const getDateFilterFromQuery = (query: Record<string, unknown>) => {
  if (query.startDate && query.endDate) {
    const start = moment(query.startDate as string).startOf('day').toDate();
    const end = moment(query.endDate as string).endOf('day').toDate();
    return { createdAt: { $gte: start, $lte: end } };
  }
  if (query.currentWeek === 'true') {
    const startOfWeek = moment().startOf('isoWeek').toDate();
    const endOfWeek = moment().endOf('isoWeek').toDate();
    return { createdAt: { $gte: startOfWeek, $lte: endOfWeek } };
  }
  // Default: Return all rides (initial screen view)
  return {};
};

const createRideInDB = async (payload: Partial<TRide>) => {
  const { startOfWeek, endOfWeek } = { 
    startOfWeek: moment().startOf('isoWeek').toDate(), 
    endOfWeek: moment().endOf('isoWeek').toDate() 
  };

  const existingRide = await Ride.findOne({ 
    user: payload.user, 
    isDeleted: false,
    createdAt: { $gte: startOfWeek, $lte: endOfWeek }
  });

  if (existingRide) {
    throw new AppError(
      httpStatus.BAD_REQUEST, 
      "You already have an active ride uploaded for this week. You can upload a new ride next week."
    );
  }

  const result = await Ride.create(payload);

  await PointServices.addPoints(payload.user!.toString(), 'social_share' as any, 50);
  
  return result;
};

const getAllRidesFromDB = async (query: Record<string, unknown>, currentUserId?: string) => {
  const { startDate, endDate, currentWeek, ...cleanedQuery } = query;
  const dateFilter = getDateFilterFromQuery(query);

  const rideQuery = new QueryBuilder(
    Ride.find({ isDeleted: false, ...dateFilter }).populate('user', 'firstName lastName image memberNumber status country'), cleanedQuery
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
const getLeaderboardFromDB = async (query: Record<string, unknown> = {}) => {
  const dateFilter = getDateFilterFromQuery(query);

  return await Ride.find({ 
    isDeleted: false,
    ...dateFilter
  })
    .sort({ averageRating: -1, flameCount: -1 })
    .limit(10)
    .populate('user', 'firstName lastName image memberNumber');
};

const setBikeOfTheWeekInDB = async (rideId: string) => {
  const ride = await Ride.findById(rideId).populate('user');
  if (!ride) throw new AppError(httpStatus.NOT_FOUND, 'Ride not found');

  const startOfWeek = moment().startOf('isoWeek').toDate();
  const endOfWeek = moment().endOf('isoWeek').toDate();

  // 1. Ensure the ride belongs to the CURRENT week
  const rideCreatedAt = moment((ride as any).createdAt);
  if (rideCreatedAt.isBefore(startOfWeek) || rideCreatedAt.isAfter(endOfWeek)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You can only select a winner from the current week's rides! Old rides cannot be selected as winner."
    );
  }

  // 2. Ensure this ride isn't already marked as winner
  if (ride.isBikeOfTheWeek) {
    throw new AppError(httpStatus.BAD_REQUEST, 'This ride is already selected as Bike of the Week!');
  }

  // 3. Ensure a winner hasn't already been selected for this current week
  const existingWeekWinner = await Ride.findOne({
    isBikeOfTheWeek: true,
    createdAt: { $gte: startOfWeek, $lte: endOfWeek }
  });

  if (existingWeekWinner) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'A winner has already been selected for this week.'
    );
  }

  // 4. Reset previous winner flag so only 1 active current winner exists in DB
  await Ride.updateMany({ isBikeOfTheWeek: true }, { isBikeOfTheWeek: false });

  ride.isBikeOfTheWeek = true;
  await ride.save();

  // 500 Shred Points 
  await PointServices.addPoints(ride.user._id.toString(), 'bike_winner' as any, 500);

  await sendNotification(
    ride.user._id.toString(),
    '🏆 Bike of the Week Winner!',
    'Your ride was selected as the Bike of the Week! You earned 500 Shred Points.',
    'promo'
  );

  return ride;
};
const getMyRidesFromDB = async (userId: string, query: Record<string, unknown>) => {
  const myRideQuery = new QueryBuilder(
    Ride.find({ user: userId, isDeleted: false }).populate('user', 'firstName lastName image memberNumber status country'),
    { ...query, user: userId }
  )
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await myRideQuery.modelQuery;
  const meta = await myRideQuery.countTotal();

  const modifiedResult = result.map((ride) => {
    const rideObj = ride.toObject();
    const myVote = ride.votes.find(v => v.user.toString() === userId?.toString());

    return {
      ...rideObj,
      isVoted: !!myVote,
      myRating: myVote ? myVote.rating : 0,
      votes: undefined
    };
  });

  return { meta, result: modifiedResult };
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
  setBikeOfTheWeekInDB,
  getMyRidesFromDB,
  deleteMyRideFromDB
};

