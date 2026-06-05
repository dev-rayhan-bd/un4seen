import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { TUser } from './user.interface';
import { UserModel} from './user.model';
import httpStatus from 'http-status';
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

const getSingleUserFromDB = async (targetId: string, currentUserId: string) => {
  const user = await UserModel.findById(targetId).select('-password');
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }


  const isFollowing = user.followers.some(
    (id) => id.toString() === currentUserId.toString()
  );

  return {
    ...user.toObject(),
    isFollowing, 
  };
};



const getFollowersListFromDB = async (userId: string, query: Record<string, unknown>) => {

  const followerQuery = new QueryBuilder(
    UserModel.find({ following: userId }).select('firstName lastName image memberNumber status'),
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
    UserModel.find({ followers: userId }).select('firstName lastName image memberNumber status'),
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

export const UserServices = {
  getMyProfileFromDB,
  updateProfileInDB,
  followUserInDB,
  unfollowUserInDB,
  getSingleUserFromDB,
  getFollowersListFromDB,
  getFollowingListFromDB
};