import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { CrewChoice } from './crewChoice.model';
import moment from 'moment';

const createPollInDB = async (payload: any) => {
  return await CrewChoice.create(payload);
};

const formatPollData = (poll: any, userId: string, now: Date) => {
  const pollObj = poll.toObject();
  const totalVotes = pollObj.totalVotes || 0;

  let mySelectionIndex = -1;
  pollObj.options.forEach((opt: any, index: number) => {
    if (opt.voters?.some((vId: any) => vId.toString() === userId.toString())) {
      mySelectionIndex = index;
    }
  });

  const diff = moment(pollObj.endDate).diff(moment(now), 'days');

  return {
    _id: pollObj._id,
    title: pollObj.title,
    description: pollObj.description,
    category: pollObj.category,
    iconStyle: pollObj.iconStyle,
    status: pollObj.status, // ফিক্সড: স্ট্যাটাস এখন রেসপন্সে যাবে
    timeLabel: diff > 0 ? `${diff} days left` : "Ended",
    totalVotes,
    hasVoted: mySelectionIndex !== -1,
    mySelectionIndex,
    options: pollObj.options.map((opt: any) => {
      const count = opt.voters?.length || 0;
      return {
        label: opt.label,
        voteCount: count,
        percentage: totalVotes > 0 ? ((count / totalVotes) * 100).toFixed(1) : "0"
      };
    })
  };
};

const getActivePollsFromDB = async (userId: string) => {
  const now = new Date();
  const polls = await CrewChoice.find({ 
    isDeleted: false, 
    status: 'active',
    endDate: { $gt: now } 
  }).sort({ createdAt: -1 });

  return polls.map(poll => formatPollData(poll, userId, now));
};
const castVoteInDB = async (userId: string, pollId: string, optionIndex: number) => {
  const poll = await CrewChoice.findById(pollId);
  if (!poll) throw new AppError(httpStatus.NOT_FOUND, 'Poll not found');

  const now = new Date();


  if (poll.status === 'ended' || now > poll.endDate) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Voting has already ended for this poll');
  }


  if (poll.votedUsers.some(v => v.toString() === userId)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'You already voted');
  }


  return await CrewChoice.findByIdAndUpdate(
    pollId,
    {
      $inc: { totalVotes: 1 },
      $addToSet: { 
        votedUsers: userId, 
        [`options.${optionIndex}.voters`]: userId 
      }
    },
    { new: true }
  );
};
const getPastPollsFromDB = async (userId: string) => {
  const now = new Date();

  const polls = await CrewChoice.find({ 
    isDeleted: false,
    $or: [
      { status: 'ended' },
      { endDate: { $lte: now } }
    ]
  }).sort({ endDate: -1 });

  return polls.map(poll => formatPollData(poll, userId, now));
};


export const CrewChoiceServices = { createPollInDB, getActivePollsFromDB, castVoteInDB ,getPastPollsFromDB};