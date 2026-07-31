import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { Giveaway } from './giveaway.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { TGiveaway } from './giveaway.interface';
import { computeDateBasedStatus } from '../../utils/computeDateBasedStatus';

const updateExpiredGiveaways = async () => {
  const now = new Date();
  await Giveaway.updateMany(
    { status: 'pending', endDate: { $lt: now } },
    { $set: { status: 'completed' } }
  );
};

const validateGiveawayDates = async (
  startDateInput: Date | string,
  endDateInput: Date | string,
  isMajorGiveaway: boolean = false,
  excludeId?: string
) => {
  const start = new Date(startDateInput);
  const end = new Date(endDateInput);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid start or end date format.');
  }

  if (start >= end) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Giveaway end date must be after start date.'
    );
  }

  const query: any = {
    isMajorGiveaway: isMajorGiveaway ?? false,
    startDate: { $lt: end },
    endDate: { $gt: start }
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  const existingOverlap = await Giveaway.findOne(query);

  if (existingOverlap) {
    const overlapStart = new Date(existingOverlap.startDate).toLocaleDateString();
    const overlapEnd = new Date(existingOverlap.endDate).toLocaleDateString();
    const typeLabel = isMajorGiveaway ? 'major giveaway' : 'giveaway';

    throw new AppError(
      httpStatus.BAD_REQUEST,
      `A ${typeLabel} already exists in this date range (${overlapStart} - ${overlapEnd}). A new giveaway must start after existing giveaway end dates.`
    );
  }
};

const getAllGiveawaysFromDB = async (query: Record<string, unknown>) => {
  await updateExpiredGiveaways();

  const giveawayQuery = new QueryBuilder(Giveaway.find().populate('winner', 'firstName lastName image memberNumber'), query)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await giveawayQuery.modelQuery;
  const meta = await giveawayQuery.countTotal();
  return { meta, result };
};

const getActiveGiveawayFromDB = async () => {
  await updateExpiredGiveaways();

  const result = await Giveaway.findOne({ 
    status: 'pending', 
    endDate: { $gte: new Date() } 
  }).sort({ endDate: 1 });
  
  return result;
};

const getSingleGiveawayFromDB = async (id: string) => {
  const result = await Giveaway.findById(id).populate('winner');
  if (!result) throw new AppError(httpStatus.NOT_FOUND, 'Giveaway not found');
  return result;
};

const createGiveawayIntoDB = async (payload: TGiveaway) => {
  await updateExpiredGiveaways();
  await validateGiveawayDates(payload.startDate, payload.endDate, payload.isMajorGiveaway);

  const phase = computeDateBasedStatus(payload.startDate, payload.endDate);
  payload.status = phase === 'ended' ? 'completed' : 'pending';
  const result = await Giveaway.create(payload);
  return result;
};

const updateGiveawayWinnerInDB = async (id: string, winnerId: string) => {
  const giveaway = await Giveaway.findById(id);
  if (!giveaway) throw new AppError(httpStatus.NOT_FOUND, 'Giveaway not found');

  const result = await Giveaway.findByIdAndUpdate(
    id,
    { 
      winner: winnerId,
      status: 'completed'
    },
    { new: true }
  );
  return result;
};

const updateGiveawayInDB = async (id: string, payload: Partial<TGiveaway>) => {
  await updateExpiredGiveaways();
  const existing = await Giveaway.findById(id);
  if (!existing) throw new AppError(httpStatus.NOT_FOUND, 'Giveaway not found');

  const startDate = payload.startDate || existing.startDate;
  const endDate = payload.endDate || existing.endDate;
  const isMajor = payload.isMajorGiveaway !== undefined ? payload.isMajorGiveaway : existing.isMajorGiveaway;

  await validateGiveawayDates(startDate, endDate, isMajor, id);

  const phase = computeDateBasedStatus(startDate, endDate);
  payload.status = phase === 'ended' ? 'completed' : 'pending';

  const result = await Giveaway.findByIdAndUpdate(id, payload, { new: true });
  return result;
};

const deleteGiveawayFromDB = async (id: string) => {
  const result = await Giveaway.findByIdAndDelete(id);
  if (!result) throw new AppError(httpStatus.NOT_FOUND, 'Giveaway not found');
  return result;
};

const getGiveawayPageDataFromDB = async () => {
  await updateExpiredGiveaways();
  const now = new Date();

  const currentWeekly = await Giveaway.findOne({
    status: 'pending',
    startDate: { $lte: now },
    endDate: { $gte: now }
  }).sort({ weekNumber: 1 });

  const majorGiveaway = await Giveaway.find({
    isMajorGiveaway: true,
    status: 'pending',
    endDate: { $gte: now }
  }).sort({ endDate: 1 });

  const upcoming = await Giveaway.find({
    status: 'pending',
    startDate: { $gt: now }
  }).sort({ startDate: 1 });

  return {
    currentWeekly: currentWeekly || null,
    majorGiveaway: majorGiveaway, 
    upcoming: upcoming
  };
};

export const GiveawayServices = {
  getAllGiveawaysFromDB,
  getActiveGiveawayFromDB,
  getSingleGiveawayFromDB,
  createGiveawayIntoDB,
  updateGiveawayInDB,
  deleteGiveawayFromDB,
  updateGiveawayWinnerInDB,
  getGiveawayPageDataFromDB
};