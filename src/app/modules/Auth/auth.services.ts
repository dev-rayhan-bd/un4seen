import httpStatus from 'http-status';
import config from '../../config';
import AppError from '../../errors/AppError';
import { UserModel } from '../User/user.model';
import sendEmail from '../../utils/sendEmail';
import { getEmailTemplate } from '../../utils/emailTemplate';
import { createToken, verifyToken } from './auth.utils';

const generateRandomPassword = () => {
  return Math.random().toString(36).slice(-8) + "@MX"; 
};

const registerFromShopify = async (payload: any) => {
  const { email, first_name, last_name, id } = payload;
  

  let user = await UserModel.findOne({ email });

  if (!user) {
    const tempPassword = generateRandomPassword(); 

    // auto hash by  pre-save 
    user = await UserModel.create({
      email,
      firstName: first_name,
      lastName: last_name,
      shopifyCustomerId: id,
      password: tempPassword, 
      status: 'active', 
    });

    // email template
    const html = getEmailTemplate({
      userName: user.firstName,
      title: "WELCOME TO THE SYNDICATE",
      body: `Your account has been successfully created. You can now access the exclusive Syndicate features using the credentials below:<br><br>
             <strong>Email:</strong> ${email}<br>
             <strong>Temporary Password:</strong> ${tempPassword}<br><br>
             <em>Note: For security, we recommend changing your password from your profile settings after your first login.</em>`,
      buttonText: "OPEN THE APP",
      buttonLink: "https://your-app-download-link.com" // app store link
    });


    await sendEmail({ 
        to: email, 
        subject: "Your Syndicate Account Credentials", 
        html 
    });
  }

  return user;
};




const forgotPassword = async (email: string) => {
  const user = await UserModel.findOne({ email });
  if (!user) throw new AppError(404, "User not found");

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expireDate = new Date(Date.now() + 10 * 60 * 1000); 

  await UserModel.findByIdAndUpdate(user._id, {
    verificationCode: otp,
    verificationExpire: expireDate,
  });

  const html = getEmailTemplate({
    userName: user.firstName,
    title: "RESET YOUR PASSWORD",
    body: `Use the code below to reset your password. This code will expire in 10 minutes.`,
    otpCode: otp
  });

  await sendEmail({ to: email, subject: "Password Reset OTP", html });
  return null;
};

// (Verify OTP)
const verifyOTP = async (email: string, otp: string) => {
  const user = await UserModel.findOne({ 
    email, 
    verificationCode: otp, 
    verificationExpire: { $gt: new Date() } 
  });

  if (!user) throw new AppError(400, "Invalid or expired OTP");
  return { message: "OTP Verified. You can now reset your password." };
};

// (Reset Password)
const resetPassword = async (payload: any) => {
  const { email, newPassword } = payload;
  const user = await UserModel.findOne({ email });
  if (!user) throw new AppError(404, "User not found");

  user.password = newPassword;
  user.verificationCode = undefined;
  user.verificationExpire = undefined;
  await user.save();
  return null;
};

const loginUser = async (payload: any) => {
  const user = await UserModel.isUserExistsByEmail(payload.email);
  if (!user || user.isDeleted || user.status === 'blocked') {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found or account is blocked');
  }

  const isPasswordMatched = await UserModel.isPasswordMatched(payload.password, user.password!);
  if (!isPasswordMatched) {
    throw new AppError(httpStatus.FORBIDDEN, 'Invalid email or password');
  }

  const jwtPayload = { userId: user._id!.toString(), role: user.role };
  const accessToken = createToken(jwtPayload, config.jwt_access_secret!, config.jwt_access_expires_in!);
  const refreshToken = createToken(jwtPayload, config.jwt_refresh_secret!, config.jwt_refresh_expires_in!);

  return { accessToken, refreshToken, user };
};

const resendOTP = async (email: string) => {
  const user = await UserModel.findOne({ email });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expireDate = new Date(Date.now() + 5 * 60 * 1000); //5 minutes

  await UserModel.findByIdAndUpdate(user._id, {
    verificationCode: otp,
    verificationExpire: expireDate,
  });

  const html = getEmailTemplate({
    userName: user.firstName,
    title: "NEW OTP REQUESTED",
    body: `You requested a new verification code. Use the OTP below to proceed. This code expires in 10 minutes.`,
    otpCode: otp
  });

  await sendEmail({ to: email, subject: "New Password Reset OTP", html });
};


const refreshToken = async (token: string) => {

  let decoded;
  try {
    decoded = verifyToken(token, config.jwt_refresh_secret as string);
  } catch (err) {
    throw new AppError(httpStatus.FORBIDDEN, 'Refresh token is expired or invalid!');
  }

  const { userId } = decoded;


  const user = await UserModel.findById(userId);
  if (!user || user.status === 'blocked' || user.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found or blocked!');
  }


  const jwtPayload = { userId: user._id.toString(), role: user.role };
  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string
  );

  return { accessToken };
};
const changePassword = async (userId: string, payload: any) => {
  const { oldPassword, newPassword } = payload;

 
  const user = await UserModel.findById(userId).select('+password');

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }

  const isPasswordMatched = await UserModel.isPasswordMatched(
    oldPassword,
    user.password!,
  );

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.FORBIDDEN, 'Old password does not match!');
  }


  user.password = newPassword;
  user.passwordChangedAt = new Date();
  await user.save();

  return null;
};
export const AuthServices = { registerFromShopify, loginUser, forgotPassword, resendOTP, verifyOTP, resetPassword ,refreshToken,changePassword};