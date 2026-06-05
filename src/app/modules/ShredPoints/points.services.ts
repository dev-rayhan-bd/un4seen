import httpStatus from 'http-status';
import moment from 'moment';
import AppError from '../../errors/AppError';
import { UserModel } from '../User/user.model';
import { PointTransaction } from './points.model';
import { POINT_VALUES, TPointSource } from './points.constant';
import { createShopifyDiscountCode } from '../Shopify/shopify.service';
import { sendNotification } from '../../utils/sendNotification';
import QueryBuilder from '../../builder/QueryBuilder';
import { Milestone } from '../Milestone/milestone.model';
import { ClaimedMilestone } from '../Milestone/claimedMilestone.model';
import { CommunityMilestone } from '../CommunityMilestone/communityMilestone.model';
import { ClaimedCommunityMilestone } from '../CommunityMilestone/claimedCommunityMilestone.model';


const addPoints = async (userId: string, source: TPointSource, customAmount?: number) => {
  const user = await UserModel.findById(userId);
  if (!user) throw new AppError(httpStatus.NOT_FOUND, 'User not found');

  const pointsToAdd = customAmount || (POINT_VALUES as any)[source.toUpperCase()] || 0;

  user.shredPoints = (user.shredPoints || 0) + pointsToAdd;
  await user.save();

  await PointTransaction.create({
    user: userId,
    points: pointsToAdd,
    source,
    description: `Earned points from ${source.replace('_', ' ')}`,
  });


  await sendNotification(
    userId,
    'Shred Points Earned! ⚡',
    `You've just earned ${pointsToAdd} points! Your new balance is ${user.shredPoints}.`,
    'promo'
  );

  return user.shredPoints;
};


const claimDailyPoints = async (userId: string) => {
  const user = await UserModel.findById(userId);
  const today = moment().format('YYYY-MM-DD');

  if (user?.lastDailyClaimDate === today) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Already claimed today');
  }

  user!.lastDailyClaimDate = today;
  await user!.save();

  return await addPoints(userId, 'daily_login', POINT_VALUES.DAILY_LOGIN);
};


const redeemPoints = async (userId: string) => {
  const user = await UserModel.findById(userId);
  if ((user?.shredPoints || 0) < POINT_VALUES.REDEEM_THRESHOLD) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Insufficient points');
  }

  const discountCode = await createShopifyDiscountCode(POINT_VALUES.REDEEM_VALUE_USD);

  user!.shredPoints! -= POINT_VALUES.REDEEM_THRESHOLD;
  await user!.save();

  await PointTransaction.create({
    user: userId,
    points: -POINT_VALUES.REDEEM_THRESHOLD,
    source: 'redeem',
    description: `Redeemed for $${POINT_VALUES.REDEEM_VALUE_USD} Shopify credit`,
    shopifyDiscountCode: discountCode,
  });

  await sendNotification(
    userId,
    'Reward Redeemed! 🎁',
    `Your $${POINT_VALUES.REDEEM_VALUE_USD} code is ${discountCode}. Happy shopping!`,
    'promo'
  );

  return { discountCode, balance: user!.shredPoints };
};


const handleSocialShare = async (userId: string, platform: string) => {
  return await addPoints(userId, `share_${platform}` as TPointSource, POINT_VALUES.SOCIAL_SHARE);
};
const getMyPointHistoryFromDB = async (userId: string, query: Record<string, unknown>) => {
  const pointQuery = new QueryBuilder(
    PointTransaction.find({ user: userId }), 
    query
  )
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await pointQuery.modelQuery;
  const meta = await pointQuery.countTotal();

  return {
    meta,
    result,
  };
};



const getShredPointsDashboard = async (userId: string) => {
  const user = await UserModel.findById(userId);
  const totalUsers = await UserModel.countDocuments(); // Community goals

  const birthdayStatus = await checkAndAwardBirthdayReward(userId);
  const today = moment().format('YYYY-MM-DD');
  const canClaimDaily = user?.lastDailyClaimDate !== today;

  const totalActiveMembers = await UserModel.countDocuments({ status: 'active' });

  const milestones = await CommunityMilestone.find({ status: 'active' }).sort({ targetMemberCount: 1 });
const claimedMilestoneIds = await ClaimedCommunityMilestone.find({ user: userId }).distinct('milestone');
 const communityMilestones = milestones.map(m => {

    const progress = Math.min((totalActiveMembers / m.targetMemberCount) * 100, 100);
     const isUnlocked = totalActiveMembers >= m.targetMemberCount;
  const isClaimed = claimedMilestoneIds.some(id => id.toString() === m._id.toString());
    return {
      _id: m._id,
      title: m.title,
      description: m.description,
      image: m.image,
      targetMembers: m.targetMemberCount,
      currentMembers: totalActiveMembers,
      progress: progress.toFixed(2),
      isUnlocked,
        isClaimed,
      rewardType: m.rewardType
    };
  });

  //  (Sticker Pack,T-Shirt)
  const allMilestones = await Milestone.find({ status: 'active' }).sort({ pointsRequired: 1 });
  const userClaimedIds = await ClaimedMilestone.find({ user: userId }).distinct('milestone');

  const individualMilestones = allMilestones.map(m => {
    const progress = Math.min((user?.shredPoints || 0) / m.pointsRequired * 100, 100);
    return {
      ...m.toObject(),
      progress: progress.toFixed(2),
      isUnlocked: (user?.shredPoints || 0) >= m.pointsRequired,
      isClaimed: userClaimedIds.some(id => id.toString() === m._id.toString())
    };
  });

  //( Recent Activity list)
  const recentActivity = await PointTransaction.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(5);

  return {
    userStats: {
      totalPoints: user?.shredPoints || 0,
      memberNumber: user?.memberNumber,
      fullName: user?.fullName
    },
    dailyLogin: {
      canClaimDaily,
      points: POINT_VALUES.DAILY_LOGIN
    },
     profileCompletion: {
        isComplete: user?.isProfileComplete || false,
        isClaimed: user?.isProfileBonusClaimed || false, 
        points: POINT_VALUES.PROFILE_COMPLETION
      },
    celebration: birthdayStatus,
    communityMilestones,
    individualMilestones,
    recentActivity
  };
};


const claimMilestoneReward = async (userId: string, milestoneId: string) => {
  const user = await UserModel.findById(userId);
  const milestone = await Milestone.findById(milestoneId);

  if (!milestone) throw new AppError(httpStatus.NOT_FOUND, "Milestone not found");
  if ((user?.shredPoints || 0) < milestone.pointsRequired) {
  throw new AppError(httpStatus.BAD_REQUEST, "Insufficient points to claim this reward");
  }

  const alreadyClaimed = await ClaimedMilestone.findOne({ user: userId, milestone: milestoneId });
  if (alreadyClaimed) throw new AppError(httpStatus.BAD_REQUEST, "Already claimed");

  const result = await ClaimedMilestone.create({
    user: userId,
    milestone: milestoneId
  });

  return result;
};


const claimProfileCompletionPoints = async (userId: string) => {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (!user.isProfileComplete) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Profile is not 100% complete yet');
  }


  const alreadyClaimed = await PointTransaction.findOne({
    user: userId,
    source: 'profile_completion'
  });

  if (alreadyClaimed) {
    throw new AppError(httpStatus.BAD_REQUEST, 'You have already claimed your profile completion bonus');
  }


  const bonusPoints = POINT_VALUES.PROFILE_COMPLETION;
  user.shredPoints = (user.shredPoints || 0) + bonusPoints;
   user.isProfileBonusClaimed = true; 
  await user.save();

  const transaction = await PointTransaction.create({
    user: userId,
    points: bonusPoints,
    source: 'profile_completion',
    description: 'Bonus points for 100% profile completion'
  });


  await sendNotification(
    userId,
    'Profile Bonus Claimed! 🎉',
    `You've received ${bonusPoints} points for completing your profile.`
  );

  return {
    newBalance: user.shredPoints,
    transaction
  };
};

const checkAndAwardBirthdayReward = async (userId: string) => {
  const user = await UserModel.findById(userId);
  if (!user || !user.dob) return { showBirthdayPopup: false };

  const today = new Date();
  const dob = new Date(user.dob);
  const currentYear = today.getFullYear();


  const isBirthday = 
    today.getMonth() === dob.getMonth() && 
    today.getDate() === dob.getDate();


  const alreadyAwardedThisYear = user.lastBirthdayRewardYear === currentYear;

  if (isBirthday && !alreadyAwardedThisYear) {

    const bonus = POINT_VALUES.BIRTHDAY_BONUS;
    user.shredPoints = (user.shredPoints || 0) + bonus;
    user.lastBirthdayRewardYear = currentYear;
    await user.save();


    await PointTransaction.create({
      user: userId,
      points: bonus,
      source: 'birthday_bonus',
      description: `Happy Birthday! You've received ${bonus} points.`
    });

    return { 
      showBirthdayPopup: true, 
      birthdayPoints: bonus 
    };
  }

  return { showBirthdayPopup: false };
};

export const PointServices = {
  addPoints,
  claimDailyPoints,
  redeemPoints,
  handleSocialShare,
  getMyPointHistoryFromDB,
    getShredPointsDashboard,
    claimMilestoneReward,
    claimProfileCompletionPoints,
    checkAndAwardBirthdayReward
};