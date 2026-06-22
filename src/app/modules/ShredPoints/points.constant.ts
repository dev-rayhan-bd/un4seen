import { PointSettings } from "../PointSettings/pointSettings.model";

export const POINT_VALUES = {
  DAILY_LOGIN: 10,
  PROFILE_COMPLETION: 100,
  SOCIAL_SHARE: 50,
  GOOGLE_REVIEW: 150,
  BIKE_OF_WEEK_WINNER: 500,
  BIRTHDAY_BONUS: 500,
  REFERRAL_JOIN: 200,
  REDEEM_THRESHOLD: 1000,
  REDEEM_VALUE_USD: 10,
  REFERRAL_SENDER: 1000,
  REFERRAL_RECEIVER: 200,
};


export const syncPointValues = async () => {
  try {
    const settings = await PointSettings.findOne();
    if (settings) {
      POINT_VALUES.DAILY_LOGIN = settings.daily_login;
      POINT_VALUES.PROFILE_COMPLETION = settings.profile_completion;
      POINT_VALUES.SOCIAL_SHARE = settings.social_share;
      POINT_VALUES.GOOGLE_REVIEW = settings.google_review;
      POINT_VALUES.BIKE_OF_WEEK_WINNER = settings.bike_winner;
      POINT_VALUES.BIRTHDAY_BONUS = settings.birthday_bonus;
      POINT_VALUES.REFERRAL_SENDER = settings.referral_sender;
      POINT_VALUES.REFERRAL_RECEIVER = settings.referral_receiver;
      POINT_VALUES.REDEEM_THRESHOLD = settings.redeem_threshold;
      POINT_VALUES.REDEEM_VALUE_USD = settings.redeem_value_nzd;
      console.log("✅ POINT_VALUES synced from Database");
    }
  } catch (error) {
    console.error("❌ Failed to sync POINT_VALUES:", error);
  }
};

export type TPointSource = 
  | 'daily_login' 
  | 'profile_completion' 
  | 'share_facebook' 
  | 'share_instagram' 
  | 'share_tiktok' 
  | 'referral' 
  | 'google_review' 
  | 'bike_winner' 
  | 'admin_adjustment' 
  | 'redeem'
  | 'milestone_claim'
  |'community_milestone_claim'
  | 'birthday_bonus';