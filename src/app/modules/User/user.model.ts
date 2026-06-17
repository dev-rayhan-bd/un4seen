import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';
import { TUser, UserModelStatic } from './user.interface';

const userSchema = new Schema<TUser, UserModelStatic>({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, select: false },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  fullName: { type: String },
    fcmToken: { type: String },
  memberNumber: { type: String, unique: true }, // e.g., #0001
  role: { type: String, enum: ['superAdmin', 'admin', 'member', 'guest'], default: 'member' },
  status: { type: String, enum: ['active', 'inactive'], default: 'inactive' },
  image: { type: String },
  aboutMe: { type: String, default: '' },
    facebookURL: { type: String, default: '' },
    instagramURL: { type: String, default: '' },
    tiktokURL: { type: String, default: '' },
       followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    followerCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },
  shredPoints: { type: Number, default: 0 },
  passwordChangedAt: { type: Date },
      dob: { type: Date },
    phoneNumber: { type: String },
    country: { type: String, default: 'New Zealand' },
    address: {
      streetAddress: String,
      city: String,
      postalCode: String,
      state: String,
    },
    clothingFit: { type: String },
    tShirtSize: { type: String },
    hoodieSize: { type: String },
    rideInfo: {
      rideType: [String],
      ridingLevel: String,
      bikeModel: String,
      year: String,
    },
     referralCode: { type: String, unique: true },
  referredBy: { type: Schema.Types.ObjectId, ref: 'User' },
  referrals: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  referralCount: { type: Number, default: 0 },
   shopifyCustomerId: { type: String },
    lastBirthdayRewardYear: { type: Number, default: 0 },
    isProfileBonusClaimed: { type: Boolean, default: false },
    isProfileComplete: { type: Boolean, default: false },
    verificationCode: { type: String, select: false },
    isOtpVerified: { type: Boolean, default: false },
    isOnline: { type: Boolean, default: false },
    verificationExpire: { type: Date, select: false },

    lastDailyClaimDate: { 
  type: String, 
  default: null 
},
}, { timestamps: true });

// Sequential Member ID Logic
userSchema.pre('save', async function (next) {

  const user = this as any; 

  if (user.isNew && !user.memberNumber) {

    const lastUser = await (this.constructor as any).findOne({}, {}, { sort: { 'createdAt': -1 } });
    
    let nextNum = 1;
    if (lastUser && lastUser.memberNumber) {
      nextNum = parseInt(lastUser.memberNumber.replace('#', '')) + 1;
    }
    user.memberNumber = `#${nextNum.toString().padStart(4, '0')}`;
  }
  if (user.isNew && !user.referralCode) {
    // exp: UN4-A1B2C
    const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
    user.referralCode = `UN4-${randomStr}`;
  }

  if (user.isModified('password') && user.password) {
    user.password = await bcrypt.hash(user.password, 12);
  }

  if (user.firstName && user.lastName) {
    user.fullName = `${user.firstName} ${user.lastName}`;
  }

  // next();
});
userSchema.statics.isUserExistsByEmail = async function (email: string) {
  return await this.findOne({ email }).select('+password');
};

userSchema.statics.isUserExistsById = async function (id: string) {
  return await this.findById(id).select('+password');
};

userSchema.statics.isPasswordMatched = async function (
  plainTextPassword,
  hashedPassword,
) {
  return await bcrypt.compare(plainTextPassword, hashedPassword);
};

userSchema.statics.isJWTIssuedBeforePasswordChanged = function (
  passwordChangedTimestamp: Date,
  jwtIssuedTimestamp: number,
) {
  const passwordChangedTime = new Date(passwordChangedTimestamp).getTime() / 1000;
  return passwordChangedTime > jwtIssuedTimestamp;
}

export const UserModel = model<TUser, UserModelStatic>('User', userSchema);