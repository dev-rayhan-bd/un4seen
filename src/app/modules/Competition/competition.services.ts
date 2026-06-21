import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { Competition, CompetitionEntry } from './competition.model';
import { PointServices } from '../ShredPoints/points.services';
import { TCompetition } from './competition.interface';
import QueryBuilder from '../../builder/QueryBuilder';

const submitEntryInDB = async (userId: string, payload: any) => {
  const competition = await Competition.findById(payload.competition);
  if (!competition) throw new AppError(httpStatus.NOT_FOUND, "Competition not found");

  const now = new Date();
  if (now > new Date(competition.endDate)) {
    throw new AppError(httpStatus.BAD_REQUEST, "This competition has ended. Submissions are closed.");
  }

  const alreadySubmitted = await CompetitionEntry.findOne({ user: userId, competition: payload.competition });
  if (alreadySubmitted) throw new AppError(httpStatus.BAD_REQUEST, "You already submitted an entry!");

  const result = await CompetitionEntry.create({ ...payload, user: userId });
  return result;
};

const getCompetitionGallery = async (competitionId: string, currentUserId?: string) => {
  const result = await CompetitionEntry.find({ competition: competitionId })
    .populate('user', 'fullName image memberNumber')
    .sort({ heartCount: -1 });

  return result.map((entry) => {
    const entryObj = entry.toObject();

    const isHearted = currentUserId 
      ? entry.hearts.map(id => id.toString()).includes(currentUserId.toString()) 
      : false;

    return {
      ...entryObj,
      isHearted,
    };
  });
};
const createCompetitionIntoDB = async (payload: TCompetition) => {
  const now = new Date();
  const startDate = new Date(payload.startDate);
  const endDate = new Date(payload.endDate);


  if (now < startDate) {
    payload.status = 'upcoming'; 
  } else if (now >= startDate && now <= endDate) {
    payload.status = 'active';  
  } else {
    payload.status = 'ended';  
  }

  const result = await Competition.create(payload);
  return result;
};

const getAllCompetitionsFromDB = async (query: Record<string, unknown>, currentUserId?: string) => {
  const competitionQuery = new QueryBuilder(Competition.find(), query)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await competitionQuery.modelQuery.lean() as any[];
  const meta = await competitionQuery.countTotal();

  const now = new Date();


  const modifiedResult = await Promise.all(result.map(async (comp) => {
    const startDate = new Date(comp.startDate);
    const entryEndDate = new Date(comp.entryEndDate);
    const endDate = new Date(comp.endDate);

    let statusLabel = "";
    let canSubmit = false;
    let canVote = false;


    if (now < startDate) {
      statusLabel = "COMING SOON";
    } else if (now > endDate) {
      statusLabel = "ENDED";
    } else if (now <= entryEndDate) {
      statusLabel = "OPEN FOR ENTRIES";
      canSubmit = true;
    } else {
      statusLabel = "VOTING NOW";
      canVote = true;
    }


    const participantCount = await CompetitionEntry.countDocuments({ competition: comp._id });

    return {
      ...comp,
      statusLabel,
      canSubmit,
      canVote,
      participantCount,
    
    };
  }));

  return { meta, result: modifiedResult };
};

const toggleHeartInDB = async (userId: string, entryId: string) => {
  const entry = await CompetitionEntry.findById(entryId);
  if (!entry) throw new AppError(httpStatus.NOT_FOUND, 'Entry not found');

  const isHearted = entry.hearts.includes(userId as any);

  if (isHearted) {
    await CompetitionEntry.findByIdAndUpdate(entryId, {
      $pull: { hearts: userId },
      $inc: { heartCount: -1 }
    });
  } else {
    await CompetitionEntry.findByIdAndUpdate(entryId, {
      $addToSet: { hearts: userId },
      $inc: { heartCount: 1 }
    });
  }
  return { isHearted: !isHearted };
};

const getLeaderboardFromDB = async (competitionId: string) => {
  return await CompetitionEntry.find({ competition: competitionId })
    .sort({ heartCount: -1 })
    .limit(10)
    .populate('user', 'firstName lastName image memberNumber');
};

// const setWinnerInDB = async (entryId: string) => {
//   const entry = await CompetitionEntry.findById(entryId);
//   if (!entry) throw new AppError(httpStatus.NOT_FOUND, 'Entry not found');


//   await CompetitionEntry.updateMany({ competition: entry.competition }, { isWinner: false });

//   entry.isWinner = true;
//   await entry.save();


//   await PointServices.addPoints(entry.user.toString(), 'bike_winner' as any, 500);
  
//   return entry;
// };

const setWinnerInDB = async (entryId: string) => {

  const entry = await CompetitionEntry.findById(entryId).populate('competition');
  if (!entry) throw new AppError(httpStatus.NOT_FOUND, 'Entry not found');

  const competition = entry.competition as any;
  const now = new Date();

  if (now < new Date(competition.endDate)) {
    throw new AppError(
      httpStatus.BAD_REQUEST, 
      `Cannot declare winner yet! This competition ends on ${new Date(competition.endDate).toLocaleString()}`
    );
  }

  const existingWinner = await CompetitionEntry.findOne({ 
    competition: competition._id, 
    isWinner: true 
  });

  if (existingWinner) {
    throw new AppError(
      httpStatus.BAD_REQUEST, 
      "A winner has already been declared for this competition! You cannot change it now."
    );
  }

  entry.isWinner = true;
  await entry.save();

  await PointServices.addPoints(entry.user.toString(), 'bike_winner' as any, 500);
  
  return entry;
};


const getRunningCompetitionFromDB = async (currentUserId?: string) => {
  const now = new Date();


  const competition = await Competition.findOne({
    status: 'active',
    startDate: { $lte: now },
    endDate: { $gte: now }
  }).lean();

  if (!competition) return null;




  const topEntries = await CompetitionEntry.find({ competition: competition._id })
    .sort({ heartCount: -1 })
    .limit(3)
    .populate('user', 'fullName image memberNumber');

  const modifiedEntries = topEntries.map(entry => ({
    ...entry.toObject(),
    isHearted: currentUserId ? entry.hearts.some(id => id.toString() === currentUserId) : false
  }));

  return {
    ...competition,
    topEntries: modifiedEntries
  };
};

const updateCompetitionInDB = async (id: string, payload: Partial<TCompetition>) => {
  const isExist = await Competition.findById(id);
  if (!isExist) throw new AppError(httpStatus.NOT_FOUND, 'Competition not found');


  const now = new Date();
  const startDate = payload.startDate ? new Date(payload.startDate) : new Date(isExist.startDate);
  const endDate = payload.endDate ? new Date(payload.endDate) : new Date(isExist.endDate);

  if (now < startDate) {
    payload.status = 'upcoming';
  } else if (now >= startDate && now <= endDate) {
    payload.status = 'active';
  } else {
    payload.status = 'ended';
  }

  const result = await Competition.findByIdAndUpdate(id, payload, { new: true });
  return result;
};

const deleteCompetitionFromDB = async (id: string) => {
  const result = await Competition.findByIdAndDelete(id);
  if (!result) throw new AppError(httpStatus.NOT_FOUND, 'Competition not found');
  

  await CompetitionEntry.deleteMany({ competition: id });
  return result;
};





export const CompetitionServices = {
  submitEntryInDB,
  getCompetitionGallery,
  createCompetitionIntoDB,
  getAllCompetitionsFromDB,
  toggleHeartInDB,
  getLeaderboardFromDB,
  setWinnerInDB,
    getRunningCompetitionFromDB,
    updateCompetitionInDB,
    deleteCompetitionFromDB
   
};
