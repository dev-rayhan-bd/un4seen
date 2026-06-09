import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { Idea } from './idea.model';
import QueryBuilder from '../../builder/QueryBuilder';

const createIdeaInDB = async (userId: string, payload: any) => {
  return await Idea.create({ ...payload, user: userId, status: 'pending' });
};

const getAllActiveIdeasFromDB = async (query: Record<string, unknown>, userId: string) => {
  const ideaQuery = new QueryBuilder(
    Idea.find({ status: 'active', isDeleted: false }).populate('user', 'firstName lastName image'),
    query
  ).filter().sort().paginate().fields();

  const result = await ideaQuery.modelQuery;
  const meta = await ideaQuery.countTotal();


  const modifiedResult = result.map(idea => ({
    ...idea.toObject(),
    isUpvoted: idea.upvotes.includes(userId as any)
  }));

  return { meta, result: modifiedResult };
};

const toggleUpvoteInDB = async (userId: string, ideaId: string) => {
  const idea = await Idea.findById(ideaId);
  if (!idea) throw new AppError(httpStatus.NOT_FOUND, 'Idea not found');

  const hasUpvoted = idea.upvotes.includes(userId as any);

  if (hasUpvoted) {
    return await Idea.findByIdAndUpdate(ideaId, { $pull: { upvotes: userId }, $inc: { upvoteCount: -1 } }, { new: true });
  } else {
    return await Idea.findByIdAndUpdate(ideaId, { $addToSet: { upvotes: userId }, $inc: { upvoteCount: 1 } }, { new: true });
  }
};

//  (Publishing logic)
const updateIdeaStatusInDB = async (ideaId: string, status: 'active' | 'rejected') => {
  return await Idea.findByIdAndUpdate(ideaId, { status }, { new: true });
};
const getIdeaCategoriesFromDB = () => {

  const categories = Idea.schema.path('category').options.enum;
  return categories;
};
export const IdeaServices = { createIdeaInDB, getAllActiveIdeasFromDB, toggleUpvoteInDB, updateIdeaStatusInDB,getIdeaCategoriesFromDB };