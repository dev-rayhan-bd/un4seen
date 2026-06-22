import { PointSettings } from './pointSettings.model';
import { TPointSettings } from './pointSettings.interface';
import AppError from '../../errors/AppError';
import  httpStatus  from 'http-status';
import { syncPointValues } from '../ShredPoints/points.constant';
const getPointSettingsFromDB = async () => {
  const settings = await PointSettings.findOne();
  
  if (!settings) {
  
    throw new AppError(httpStatus.NOT_FOUND, 'Point settings have not been initialized yet. Please save settings from dashboard.');
  }
  
  return settings;
};

const updatePointSettingsInDB = async (payload: Partial<TPointSettings>) => {
  const result = await PointSettings.findOneAndUpdate(
    {},
    { $set: payload },
    { new: true, upsert: true }
  );
    await syncPointValues();
  return result;
};

export const PointSettingsServices = {
  getPointSettingsFromDB,
  updatePointSettingsInDB,
};