import moment from 'moment';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { TUser } from './user.interface';
import { UserModel} from './user.model';
import httpStatus from 'http-status';
import { Giveaway } from '../Giveway/giveaway.model';
import { Ride } from '../ride/ride.model';
import { PointTransaction } from '../ShredPoints/points.model';
import { Story } from '../Story/story.model';
import { Bike } from '../Bike/bike.model';
const getMyProfileFromDB = async (userId: string) => {
  const result = await UserModel.findById(userId);
  return result;
};
const updateProfileInDB = async (userId: string, payload: Partial<TUser>) => {
  const user = await UserModel.findById(userId);
  if (!user) throw new AppError(404, "User not found");
  


  if (user.dob && payload.dob) {
    delete payload.dob; 
  }

  const updatedUser = await UserModel.findByIdAndUpdate(userId, payload, { new: true });

  
  if (updatedUser && 
      updatedUser.dob && 
      updatedUser.phoneNumber && 
      updatedUser.address?.streetAddress && 
      updatedUser.rideInfo?.bikeModel) {
    updatedUser.isProfileComplete = true;
    
    await updatedUser.save();
  }

  return updatedUser;
};


const followUserInDB = async (followerId: string, targetId: string) => {
  if (followerId === targetId) {
    throw new AppError(httpStatus.BAD_REQUEST, "You cannot follow yourself!");
  }

 
  const targetUser = await UserModel.findById(targetId);
  if (!targetUser) throw new AppError(httpStatus.NOT_FOUND, "User not found");


  const isAlreadyFollowing = await UserModel.findOne({
    _id: followerId,
    following: targetId,
  });

  if (isAlreadyFollowing) {
    throw new AppError(httpStatus.BAD_REQUEST, "You are already following this user");
  }


  await UserModel.findByIdAndUpdate(followerId, {
    $addToSet: { following: targetId },
    $inc: { followingCount: 1 },
  });


  await UserModel.findByIdAndUpdate(targetId, {
    $addToSet: { followers: followerId },
    $inc: { followerCount: 1 },
  });

  return { message: "Successfully followed" };
};

const unfollowUserInDB = async (followerId: string, targetId: string) => {

  const isFollowing = await UserModel.findOne({
    _id: followerId,
    following: targetId,
  });

  if (!isFollowing) {
    throw new AppError(httpStatus.BAD_REQUEST, "You are not following this user");
  }


  await UserModel.findByIdAndUpdate(followerId, {
    $pull: { following: targetId },
    $inc: { followingCount: -1 },
  });


  await UserModel.findByIdAndUpdate(targetId, {
    $pull: { followers: followerId },
    $inc: { followerCount: -1 },
  });

  return { message: "Successfully unfollowed" };
};

// const getSingleUserFromDB = async (targetId: string, currentUserId: string) => {
//   const user = await UserModel.findById(targetId).select('-password');
//   if (!user) {
//     throw new AppError(httpStatus.NOT_FOUND, 'User not found');
//   }


//   const isFollowing = user.followers.some(
//     (id) => id.toString() === currentUserId.toString()
//   );

//   return {
//     ...user.toObject(),
//     isFollowing, 
//   };
// };
const getCompleteProfileData = async (targetId: string, viewerId: string) => {

  const user = await UserModel.findById(targetId).select('-password');
  if (!user) throw new AppError(404, 'User not found');

  const userObj = user.toObject();


  const activeBike = await Bike.findOne({ user: targetId, isRetired: false })
    .select('_id image make model year');

  const joinDate = moment(userObj.createdAt);
  const now = moment();
  const durationYears = now.diff(joinDate, 'years', true).toFixed(1);
  const durationMonths = now.diff(joinDate, 'months');

  const milestones = {
    is3moReached: durationMonths >= 3,
    is6moReached: durationMonths >= 6,
    is1yrReached: durationMonths >= 12,
    is2yrReached: durationMonths >= 24,
    is3yrReached: durationMonths >= 36,
    is4yrReached: durationMonths >= 48,
    is5yrReached: durationMonths >= 60,
  };

  const isFollowing = user.followers ? user.followers.some(
    (id: any) => id.toString() === viewerId.toString()
  ) : false;

  return {
    ...userObj,
    activeBike: activeBike || null, 
    journey: {
      memberSince: joinDate.format('MMMM YYYY'),
      totalDuration: `${durationYears} years`,
      milestones
    },
    isFollowing,
  };
};


const getFollowersListFromDB = async (userId: string, query: Record<string, unknown>) => {

  const followerQuery = new QueryBuilder(
    UserModel.find({ following: userId }),
    query
  )
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await followerQuery.modelQuery;
  const meta = await followerQuery.countTotal();

  return { meta, result };
};


const getFollowingListFromDB = async (userId: string, query: Record<string, unknown>) => {

  const followingQuery = new QueryBuilder(
    UserModel.find({ followers: userId }),
    query
  )
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await followingQuery.modelQuery;
  const meta = await followingQuery.countTotal();

  return { meta, result };
};




const getHomePageDataFromDB = async (userId: string) => {
  const now = new Date();
  const startOfWeek = moment().startOf('isoWeek').toDate();


  const user = await UserModel.findById(userId).select('firstName lastName fullName image memberNumber status');

//weekly giveawaqy
  const weeklyGiveaway = await Giveaway.findOne({ 
    status: 'pending', 
    isMajorGiveaway: false,
    startDate: { $lte: now },
    endDate: { $gte: now } 
  }).sort({ weekNumber: 1 });


  const bikeOfTheWeek = await Ride.findOne({ isBikeOfTheWeek: true })
    .populate('user', 'firstName lastName image memberNumber country');

  // major giveaway
  const majorGiveaway = await Giveaway.findOne({ 
    isMajorGiveaway: true, 
    status: 'pending' 
  }).sort({ endDate: 1 });

  //recent winner
  const recentWinners = await Giveaway.find({ status: 'completed', winner: { $exists: true } })
    .sort({ updatedAt: -1 })
    .limit(3)
    .populate('winner', 'firstName lastName image memberNumber');

  // this week stats
  const pointsThisWeek = await PointTransaction.aggregate([
    { $match: { user: user?._id, createdAt: { $gte: startOfWeek }, points: { $gt: 0 } } },
    { $group: { _id: null, total: { $sum: "$points" } } }
  ]);

  //new stories from last 247 hours
  const newStoriesCount = await Story.countDocuments({ 
    createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    isDeleted: false 
  });

  return {
    user: {
      fullName: user?.fullName,
      image: user?.image,
      isSyndicateMember: user?.status === 'active'
    },
    weeklyGiveaway: weeklyGiveaway ? {
        ...weeklyGiveaway.toObject(),
        countdownEnd: weeklyGiveaway.endDate 
    } : null,
    bikeOfTheWeek,
    majorGiveaway,
    recentWinners,
    thisWeekStats: {
      pointsEarned: pointsThisWeek[0]?.total || 0,
      newStoriesPosted: newStoriesCount
    }
  };
};














export const UserServices = {
  getMyProfileFromDB,
  updateProfileInDB,
  followUserInDB,
  unfollowUserInDB,
getCompleteProfileData,
  getFollowersListFromDB,
  getFollowingListFromDB,
  getHomePageDataFromDB
};