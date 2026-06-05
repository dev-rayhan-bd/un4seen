import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { Milestone } from './milestone.model';
import { TMilestone } from './milestone.interface';
import QueryBuilder from '../../builder/QueryBuilder';

const createMilestoneIntoDB = async (payload: TMilestone) => {
  return await Milestone.create(payload);
};

const getAllMilestonesFromDB = async (query: Record<string, unknown>) => {
  const milestoneQuery = new QueryBuilder(Milestone.find(), query)
    .filter().sort().paginate().fields();
  const result = await milestoneQuery.modelQuery;
  const meta = await milestoneQuery.countTotal();
  return { meta, result };
};

const updateMilestoneInDB = async (id: string, payload: Partial<TMilestone>) => {
  const result = await Milestone.findByIdAndUpdate(id, payload, { new: true });
  if (!result) throw new AppError(httpStatus.NOT_FOUND, 'Milestone not found');
  return result;
};

const deleteMilestoneFromDB = async (id: string) => {
  const result = await Milestone.findByIdAndDelete(id);
  if (!result) throw new AppError(httpStatus.NOT_FOUND, 'Milestone not found');
  return result;
};

export const MilestoneServices = {
  createMilestoneIntoDB,
  getAllMilestonesFromDB,
  updateMilestoneInDB,
  deleteMilestoneFromDB
};