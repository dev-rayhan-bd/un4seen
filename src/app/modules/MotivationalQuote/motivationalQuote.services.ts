import { MotivationalQuote } from './motivationalQuote.model';
import { TMotivationalQuote } from './motivationalQuote.interface';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';

const createQuoteInDB = async (payload: TMotivationalQuote) => {
  const result = await MotivationalQuote.create(payload);
  return result;
};

const upsertBulkQuotesInDB = async (payload: TMotivationalQuote[]) => {
  const bulkOps = payload.map((quote) => ({
    updateOne: {
      filter: { day: quote.day },
      update: { $set: { text: quote.text } },
      upsert: true
    }
  }));

  const result = await MotivationalQuote.bulkWrite(bulkOps);
  return result;
};

const getAllQuotesFromDB = async (query: Record<string, unknown>) => {
  const quoteQuery = new QueryBuilder(MotivationalQuote.find(), { limit: 100, sort: 'day', ...query })
    .sort()
    .filter()
    .paginate()
    .fields();

  const result = await quoteQuery.modelQuery;
  const meta = await quoteQuery.countTotal();

  return { meta, result };
};

const getTodayQuoteFromDB = async () => {
  const currentDate = new Date();
  const currentDay = currentDate.getDate(); // 1 to 31

  let quote = await MotivationalQuote.findOne({ day: currentDay });
  
  // If quote for currentDay is not created in DB, fallback to day 1 quote
  if (!quote) {
    quote = await MotivationalQuote.findOne({ day: 1 });
  }

  return quote;
};

const getQuoteByIdFromDB = async (id: string) => {
  const result = await MotivationalQuote.findById(id);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Quote not found');
  }
  return result;
};

const updateQuoteInDB = async (id: string, payload: Partial<TMotivationalQuote>) => {
  const result = await MotivationalQuote.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Quote not found');
  }
  return result;
};

const deleteQuoteFromDB = async (id: string) => {
  const result = await MotivationalQuote.findByIdAndDelete(id);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Quote not found');
  }
  return result;
};

export const MotivationalQuoteServices = {
  createQuoteInDB,
  upsertBulkQuotesInDB,
  getAllQuotesFromDB,
  getTodayQuoteFromDB,
  getQuoteByIdFromDB,
  updateQuoteInDB,
  deleteQuoteFromDB
};
