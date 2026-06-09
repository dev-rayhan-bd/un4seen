import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { FavoriteMusic, Music } from './music.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { TMusic } from './music.interface';


const createMusicInDB = async (payload: TMusic) => {
  return await Music.create(payload);
};


const getAllMusicFromDB = async (userId: string, query: Record<string, unknown>) => {
  const musicQuery = new QueryBuilder(Music.find({ isDeleted: false }), query)
    .search(['title', 'category']) 
    .filter()
    .sort()
    .paginate();

  const musicList = await musicQuery.modelQuery;
  const meta = await musicQuery.countTotal();


  const userFavorites = await FavoriteMusic.find({ user: userId }).distinct('music');

  const result = musicList.map((music) => ({
    ...music.toObject(),
    isFavorite: userFavorites.some((favId) => favId.toString() === music._id.toString()),
  }));

  return { meta, result };
};

// (Add/Remove)
const toggleFavoriteMusicInDB = async (userId: string, musicId: string) => {
  const isExist = await FavoriteMusic.findOne({ user: userId, music: musicId });

  if (isExist) {
    await FavoriteMusic.findByIdAndDelete(isExist._id);
    return { isFavorite: false, message: 'Removed from favorites' };
  } else {
    await FavoriteMusic.create({ user: userId, music: musicId });
    return { isFavorite: true, message: 'Added to favorites' };
  }
};
const getCategoriesFromDB = async () => {

  const categories = await Music.distinct('category', { isDeleted: false });
  return categories;
};

//  (Soft Delete)
const deleteMusicFromDB = async (musicId: string) => {
  const result = await Music.findByIdAndUpdate(
    musicId,
    { isDeleted: true },
    { new: true }
  );

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Music not found');
  }


  await FavoriteMusic.deleteMany({ music: musicId });

  return result;
};


const getMyFavoriteMusicFromDB = async (userId: string, query: Record<string, unknown>) => {

  const favoriteEntries = await FavoriteMusic.find({ user: userId }).distinct('music');

  const musicQuery = new QueryBuilder(
    Music.find({ 
        _id: { $in: favoriteEntries }, 
        isDeleted: false 
    }), 
    query
  )
    .search(['title', 'category'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await musicQuery.modelQuery;
  const meta = await musicQuery.countTotal();

  //isFavorite: true
  const finalResult = result.map((music) => ({
    ...music.toObject(),
    isFavorite: true,
  }));

  return { meta, result: finalResult };
};


export const MusicServices = {
  createMusicInDB,
  getAllMusicFromDB,
  toggleFavoriteMusicInDB,
    getCategoriesFromDB,
    deleteMusicFromDB,
    getMyFavoriteMusicFromDB
};