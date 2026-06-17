import { Model, Types } from 'mongoose';
export type TAddress = {
  streetAddress: string;
  city: string;
  postalCode: string;
  state: string;
};

export type TRideInfo = {
  rideType: string[]; // MX, Enduro, Ebike, etc.
  ridingLevel: 'Beginner' | 'Intermediate' | 'Recreational' | 'Advanced' | 'Pro' | 'Hobby';
  bikeModel: string;
  year: string;
};
export type TUser = {
  _id?: Types.ObjectId;
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  memberNumber?: string; // e.g: #0001
  role: 'superAdmin'|'admin' | 'member' | 'guest';
  status: 'active' | 'inactive' | 'blocked';
  referralCode: string;
  referredBy?: Types.ObjectId | TUser; 
  referrals: Types.ObjectId[];      
  referralCount: number;   
  fcmToken?: string;
  image?: string;
  shredPoints?: number;
  shopifyCustomerId?: string;
  passwordChangedAt?: Date;
  isDeleted: boolean;
    aboutMe?: string;     
  facebookURL?: string;    
  instagramURL?: string; 
  tiktokURL?: string;     
  followers: Types.ObjectId[]; 
  following: Types.ObjectId[]; 
  followerCount: number;
  followingCount: number;
lastBirthdayRewardYear?: number; 
 isProfileBonusClaimed: boolean;
  dob?: Date;
  phoneNumber?: string;
  country?: string;
  address?: TAddress;
  clothingFit?: string;
  tShirtSize?: string;
  hoodieSize?: string;
  rideInfo?: TRideInfo;
  isProfileComplete: boolean;
  verificationCode?: string;
   isOtpVerified: boolean;
   isOnline?:boolean;
  verificationExpire?: Date;
  lastDailyClaimDate?: string | null; // ISO date string or null
  createdAt: Date;
  updatedAt: Date
};

export interface UserModelStatic extends Model<TUser> {
  isUserExistsByEmail(email: string): Promise<TUser | null>;
  isPasswordMatched(plainPassword: string, hashedPassword: string): Promise<boolean>;
}
export interface UserModelStatic extends Model<TUser> {
  isUserExistsByEmail(email: string): Promise<TUser | null>;
  isUserExistsById(id: string): Promise<TUser | null>; 
  isJWTIssuedBeforePasswordChanged(
    passwordChangedTimestamp: Date,
    jwtIssuedTimestamp: number,
  ): boolean;
  isPasswordMatched(plainPassword: string, hashedPassword: string): Promise<boolean>;
}