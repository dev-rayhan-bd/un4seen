import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { CommunityMilestone } from './communityMilestone.model';
import { TCommunityMilestone } from './communityMilestone.interface';
import { UserModel } from '../User/user.model';
import { ClaimedCommunityMilestone } from './claimedCommunityMilestone.model';

const createMilestoneIntoDB = async (payload: TCommunityMilestone) => {
  return await CommunityMilestone.create(payload);
};

const getAllMilestonesFromDB = async () => {
  return await CommunityMilestone.find().sort({ targetMemberCount: 1 });
};

const updateMilestoneInDB = async (id: string, payload: Partial<TCommunityMilestone>) => {
  const result = await CommunityMilestone.findByIdAndUpdate(id, payload, { new: true });
  if (!result) throw new AppError(httpStatus.NOT_FOUND, 'Milestone not found');
  return result;
};

const deleteMilestoneFromDB = async (id: string) => {
  const result = await CommunityMilestone.findByIdAndDelete(id);
  if (!result) throw new AppError(httpStatus.NOT_FOUND, 'Milestone not found');
  return result;
};
const claimMilestoneInDB = async (userId: string, milestoneId: string) => {
  const milestone = await CommunityMilestone.findById(milestoneId);
  if (!milestone) throw new AppError(httpStatus.NOT_FOUND, 'Milestone not found');


  const totalActiveMembers = await UserModel.countDocuments({ status: 'active' });
  if (totalActiveMembers < milestone.targetMemberCount) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Community target not reached yet!');
  }


  const alreadyClaimed = await ClaimedCommunityMilestone.findOne({ 
    user: userId, 
    milestone: milestoneId 
  });
  if (alreadyClaimed) {
    throw new AppError(httpStatus.BAD_REQUEST, 'You have already claimed this reward!');
  }


  const result = await ClaimedCommunityMilestone.create({
    user: userId,
    milestone: milestoneId
  });

  return result;
};
export const CommunityMilestoneServices = {
  createMilestoneIntoDB,
  getAllMilestonesFromDB,
  updateMilestoneInDB,
  deleteMilestoneFromDB,
    claimMilestoneInDB
};