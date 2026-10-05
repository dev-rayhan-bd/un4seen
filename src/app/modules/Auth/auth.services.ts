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
      body: `
        <p style="color: #f3f4f6 !important; font-size: 15px; line-height: 1.6; margin: 0 0 22px 0;">
          Your account has been successfully created. You can now access the exclusive Syndicate features using the credentials below:
        </p>
        
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 440px; margin: 20px auto; background-color: #1a1a1a; border: 1px solid #333333; border-radius: 8px; text-align: left;">
          <tr>
            <td style="padding: 16px 20px; border-bottom: 1px solid #2a2a2a;">
              <div style="color: #cbd5e1 !important; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">Email Address</div>
              <div style="color: #00A3FF !important; font-size: 15px; font-weight: 600; word-break: break-all;">${email}</div>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 20px;">
              <div style="color: #cbd5e1 !important; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">Temporary Password</div>
              <div>
                <span style="color: #ffffff !important; font-size: 16px; font-weight: 700; font-family: 'Courier New', Courier, monospace; letter-spacing: 1.5px; background-color: #0a0a0a; border: 1px solid #00A3FF; padding: 6px 14px; border-radius: 4px; display: inline-block;">${tempPassword}</span>
              </div>
            </td>
          </tr>
        </table>

        <p style="color: #cbd5e1 !important; font-size: 13px; font-style: italic; line-height: 1.5; margin: 20px 0 0 0;">
          Note: For security, we recommend changing your password from your profile settings after your first login.
        </p>
      `,
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
  if (!user || user.isDeleted) throw new AppError(404, "User not found");

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expireDate = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

  await UserModel.findByIdAndUpdate(user._id, {
    verificationCode: otp,
    verificationExpire: expireDate,
  });

  const html = getEmailTemplate({
    userName: user.firstName,
    title: "RESET YOUR PASSWORD",
    body: `<p style="color: #f3f4f6 !important; font-size: 15px; line-height: 1.6; margin: 0 0 10px 0;">Use the code below to reset your password. This code will expire in 2 minutes.</p>`,
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

  if (!user || user.isDeleted) throw new AppError(400, "Invalid or expired OTP");
  return { message: "OTP Verified. You can now reset your password." };
};

// (Reset Password)
const resetPassword = async (payload: any) => {
  const { email, newPassword } = payload;
  const user = await UserModel.findOne({ email });
  if (!user || user.isDeleted) throw new AppError(404, "User not found");

  user.password = newPassword;
  user.verificationCode = undefined;
  user.verificationExpire = undefined;
  await user.save();
  return null;
};

const logoutUser = async (userId: string) => {
  await UserModel.findByIdAndUpdate(userId, {
    fcmToken: null,
    isOnline: false,
  });
};

const loginUser = async (payload: any) => {
  const user = await UserModel.isUserExistsByEmail(payload.email);
  if (!user || user.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found or account is blocked');
  }

  if (user.status === 'blocked') {
    if (user.blockedUntil && new Date() > user.blockedUntil) {
      await UserModel.findByIdAndUpdate(user._id, { status: 'active', $unset: { blockedUntil: 1 } });
    } else {
      throw new AppError(httpStatus.FORBIDDEN, 'Your account is blocked');
    }
  }

  const isPasswordMatched = await UserModel.isPasswordMatched(payload.password, user.password!);
  if (!isPasswordMatched) {
    throw new AppError(httpStatus.FORBIDDEN, 'Invalid email or password');
  }

  // Save FCM token if provided (from mobile app on login)
  if (payload.fcmToken) {
    await UserModel.findByIdAndUpdate(user._id, { fcmToken: payload.fcmToken });
  }

  const jwtPayload = { userId: user._id!.toString(), role: user.role };
  const accessToken = createToken(jwtPayload, config.jwt_access_secret!, config.jwt_access_expires_in!);
  const refreshToken = createToken(jwtPayload, config.jwt_refresh_secret!, config.jwt_refresh_expires_in!);

  return { accessToken, refreshToken, user };
};

const resendOTP = async (email: string) => {
  const user = await UserModel.findOne({ email });
  if (!user || user.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expireDate = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

  await UserModel.findByIdAndUpdate(user._id, {
    verificationCode: otp,
    verificationExpire: expireDate,
  });

  const html = getEmailTemplate({
    userName: user.firstName,
    title: "NEW OTP REQUESTED",
    body: `<p style="color: #f3f4f6 !important; font-size: 15px; line-height: 1.6; margin: 0 0 10px 0;">You requested a new verification code. Use the OTP below to proceed. This code expires in 2 minutes.</p>`,
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
  if (!user || user.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found or blocked!');
  }

  if (user.status === 'blocked') {
    if (user.blockedUntil && new Date() > user.blockedUntil) {
      await UserModel.findByIdAndUpdate(user._id, { status: 'active', $unset: { blockedUntil: 1 } });
    } else {
      throw new AppError(httpStatus.FORBIDDEN, 'Your account is blocked!');
    }
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
export const AuthServices = { registerFromShopify, loginUser, forgotPassword, resendOTP, verifyOTP, resetPassword ,refreshToken,changePassword, logoutUser};