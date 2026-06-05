import httpStatus from 'http-status';
import moment from 'moment';
import AppError from '../../errors/AppError';
import { UserModel } from '../User/user.model';
import { PointTransaction } from './points.model';
import { POINT_VALUES, TPointSource } from './points.constant';
import { createShopifyDiscountCode } from '../Shopify/shopify.service';
import { sendNotification } from '../../utils/sendNotification';
import QueryBuilder from '../../builder/QueryBuilder';


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
const getPointsPageDataFromDB = async (userId: string) => {
  const user = await UserModel.findById(userId).select('shredPoints lastDailyClaimDate isProfileComplete');
  
  if (!user) throw new AppError(httpStatus.NOT_FOUND, 'User not found');

  const today = moment().format('YYYY-MM-DD');
  const isDailyClaimed = user.lastDailyClaimDate === today;


  const communityMilestones = [
    { title: "25,000 members", goal: 25000, current: 18450, reward: "Free Sticker Pack" },
    { title: "50,000 members", goal: 50000, current: 18450, reward: "Giveaway Access" }
  ];


  const recentActivity = await PointTransaction.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(5);

  return {
    userPoints: user.shredPoints || 0,
    isDailyClaimed,
    profileCompletion: {
      isComplete: user.isProfileComplete,
      points: 100
    },
    milestones: communityMilestones,
    recentActivity: recentActivity
  };
};




export const PointServices = {
  addPoints,
  claimDailyPoints,
  redeemPoints,
  handleSocialShare,
  getMyPointHistoryFromDB
};