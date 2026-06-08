import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { TestRiderApplication } from './testRider.model';
import { sendNotification } from '../../utils/sendNotification';

const applyForTestRider = async (userId: string, applicationText: string) => {

  const alreadyApplied = await TestRiderApplication.findOne({ user: userId });
  if (alreadyApplied) {
    throw new AppError(httpStatus.BAD_REQUEST, 'You have already submitted an application!');
  }

  const result = await TestRiderApplication.create({
    user: userId,
    applicationText,
  });
  return result;
};

const getAllApplicationsForAdmin = async () => {
  return await TestRiderApplication.find()
    .populate('user', 'firstName lastName image phoneNumber country')
    .sort({ createdAt: -1 });
};
const reviewApplicationInDB = async (applicationId: string, status: 'accepted' | 'rejected') => {
  const application = await TestRiderApplication.findById(applicationId).populate('user');
  if (!application) {
    throw new AppError(httpStatus.NOT_FOUND, 'Application not found');
  }


  application.status = status;
  await application.save();

  const message = status === 'accepted' 
    ? 'Congratulations! Your Test Rider application has been accepted. 🏁' 
    : 'We reviewed your Test Rider application, but unfortunately, we cannot proceed at this time.';

  await sendNotification(
    application.user._id.toString(),
    status === 'accepted' ? 'Application Approved! 🎉' : 'Application Update',
    message,
    'general'
  );

  return application;
};
export const TestRiderServices = { applyForTestRider, getAllApplicationsForAdmin, reviewApplicationInDB };