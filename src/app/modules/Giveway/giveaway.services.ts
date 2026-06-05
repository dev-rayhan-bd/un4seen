import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { Giveaway } from './giveaway.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { TGiveaway } from './giveaway.interface';

const getAllGiveawaysFromDB = async (query: Record<string, unknown>) => {
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
  const result = await Giveaway.findByIdAndUpdate(id, payload, { new: true });
  if (!result) throw new AppError(httpStatus.NOT_FOUND, 'Giveaway not found');
  return result;
};

const deleteGiveawayFromDB = async (id: string) => {
  const result = await Giveaway.findByIdAndDelete(id);
  if (!result) throw new AppError(httpStatus.NOT_FOUND, 'Giveaway not found');
  return result;
};


const getGiveawayPageDataFromDB = async () => {
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