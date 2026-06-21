import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { Un4seenWorld } from './un4seenWorld.model';
import QueryBuilder from '../../builder/QueryBuilder';

const createBrandInDB = async (payload: any) => {
  return await Un4seenWorld.create(payload);
};

const getAllBrandsFromDB = async (query: Record<string, unknown>) => {
  const brandQuery = new QueryBuilder(Un4seenWorld.find({ isDeleted: false }), query)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await brandQuery.modelQuery;
  const meta = await brandQuery.countTotal();
  return { meta, result };
};

const updateBrandInDB = async (id: string, payload: any) => {
  const result = await Un4seenWorld.findByIdAndUpdate(id, payload, { new: true });
  if (!result) throw new AppError(httpStatus.NOT_FOUND, 'Brand not found');
  return result;
};

const deleteBrandFromDB = async (id: string) => {
  const result = await Un4seenWorld.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
  return result;
};

export const Un4seenWorldServices = {
  createBrandInDB,
  getAllBrandsFromDB,
  updateBrandInDB,
  deleteBrandFromDB,
};