export const POINT_VALUES = {
  DAILY_LOGIN: 10,
  PROFILE_COMPLETION: 100,
  SOCIAL_SHARE: 50,
  GOOGLE_REVIEW: 150,
  BIKE_OF_WEEK_WINNER: 500,
  REFERRAL_JOIN: 200,
  REDEEM_THRESHOLD: 1000, //1000 points needed to redeem,1000 points = $10 discount
  REDEEM_VALUE_USD: 10,
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
  | 'milestone_claim';