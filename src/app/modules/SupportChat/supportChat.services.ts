import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { SupportMessage, SupportSession } from './supportChat.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { UserModel } from '../User/user.model';

const getOrCreateUserSupportSessionInDB = async (userId: string) => {
  let session = await SupportSession.findOne({
    user: userId,
    isDeleted: false,
    status: { $in: ['open', 'in-progress'] },
  })
    .populate('user', 'firstName lastName image memberNumber email role')
    .populate('assignedAdmin', 'firstName lastName image role');

  if (!session) {
    session = await SupportSession.create({
      user: userId,
      status: 'open',
      lastMessage: 'Support chat started',
      lastMessageAt: new Date(),
    });
    session = await SupportSession.findById(session._id)
      .populate('user', 'firstName lastName image memberNumber email role')
      .populate('assignedAdmin', 'firstName lastName image role');
  }

  return session;
};

const sendSupportMessageInDB = async (
  senderId: string,
  senderRole: string,
  payload: { sessionId?: string; text?: string; file?: string }
) => {
  if (!payload.text && !payload.file) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Message text or file is required');
  }

  const isAdmin = senderRole === 'admin' || senderRole === 'superAdmin';
  let session;

  if (payload.sessionId) {
    session = await SupportSession.findById(payload.sessionId);
    if (!session) throw new AppError(httpStatus.NOT_FOUND, 'Support session not found');
  } else {
    if (isAdmin) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Session ID is required for admin replies');
    }
    session = await SupportSession.findOne({
      user: senderId,
      isDeleted: false,
      status: { $in: ['open', 'in-progress'] },
    });

    if (!session) {
      session = await SupportSession.create({
        user: senderId,
        status: 'open',
      });
    }
  }

  const messageText = payload.text || (payload.file ? 'Sent an attachment' : '');

  const newMessage = await SupportMessage.create({
    supportSession: session._id,
    sender: senderId,
    senderRole: isAdmin ? 'admin' : 'user',
    text: payload.text,
    file: payload.file,
    isRead: false,
  });

  const updateData: any = {
    lastMessage: messageText,
    lastMessageAt: new Date(),
  };

  if (isAdmin) {
    updateData.$inc = { unreadCountUser: 1 };
    updateData.assignedAdmin = senderId;
    if (session.status === 'resolved' || session.status === 'closed') {
      updateData.status = 'in-progress';
    }
  } else {
    updateData.$inc = { unreadCountAdmin: 1 };
    if (session.status === 'resolved' || session.status === 'closed') {
      updateData.status = 'open';
    }
  }

  const updatedSession = await SupportSession.findByIdAndUpdate(session._id, updateData, { new: true })
    .populate('user', 'firstName lastName image memberNumber email role')
    .populate('assignedAdmin', 'firstName lastName image role');

  const populatedMessage = await SupportMessage.findById(newMessage._id).populate(
    'sender',
    'firstName lastName image role memberNumber'
  );

  return {
    message: populatedMessage!.toObject(),
    session: updatedSession!.toObject(),
  };
};

const getSupportMessagesFromDB = async (
  userId: string,
  userRole: string,
  sessionId: string,
  query: Record<string, unknown>
) => {
  const session = await SupportSession.findById(sessionId);
  if (!session) throw new AppError(httpStatus.NOT_FOUND, 'Support session not found');

  const isAdmin = userRole === 'admin' || userRole === 'superAdmin';
  if (!isAdmin && session.user.toString() !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, 'Unauthorized access to support chat');
  }

  // Clear unread count for current reader
  if (isAdmin) {
    await SupportSession.findByIdAndUpdate(sessionId, { unreadCountAdmin: 0 });
    await SupportMessage.updateMany(
      { supportSession: sessionId, senderRole: 'user', isRead: false },
      { $set: { isRead: true } }
    );
  } else {
    await SupportSession.findByIdAndUpdate(sessionId, { unreadCountUser: 0 });
    await SupportMessage.updateMany(
      { supportSession: sessionId, senderRole: 'admin', isRead: false },
      { $set: { isRead: true } }
    );
  }

  const messageQuery = new QueryBuilder(
    SupportMessage.find({ supportSession: sessionId }).populate(
      'sender',
      'firstName lastName image role memberNumber'
    ),
    query
  )
    .sort()
    .paginate()
    .fields();

  const result = await messageQuery.modelQuery;
  const meta = await messageQuery.countTotal();

  return { meta, result, session };
};

const getAllSupportSessionsForAdminFromDB = async (query: Record<string, unknown>) => {
  const queryObj = { ...query };
  const searchTerm = (queryObj.searchTerm || queryObj.search) as string;
  delete queryObj.searchTerm;
  delete queryObj.search;

  // If "all" tab is selected or if admin is searching, search across all statuses
  if (queryObj.status === 'all' || queryObj.status === 'All') {
    delete queryObj.status;
  }

  let searchCondition: any = {};
  if (searchTerm) {
    // Global search across all statuses when search term is provided
    delete queryObj.status;

    const matchingUsers = await UserModel.find({
      $or: [
        { firstName: { $regex: searchTerm, $options: 'i' } },
        { lastName: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } },
        { memberNumber: { $regex: searchTerm, $options: 'i' } },
      ],
    }).select('_id');

    const userIds = matchingUsers.map((u: any) => u._id);
    searchCondition = {
      $or: [
        { user: { $in: userIds } },
        { lastMessage: { $regex: searchTerm, $options: 'i' } },
      ],
    };
  }

  const sessionQuery = new QueryBuilder(
    SupportSession.find({ isDeleted: false, ...searchCondition })
      .populate('user', 'firstName lastName image memberNumber email role')
      .populate('assignedAdmin', 'firstName lastName image role'),
    queryObj
  )
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await sessionQuery.modelQuery;
  const meta = await sessionQuery.countTotal();

  return { meta, result };
};

const updateSupportSessionStatusInDB = async (
  sessionId: string,
  status: 'open' | 'in-progress' | 'resolved' | 'closed',
  adminId: string
) => {
  const session = await SupportSession.findById(sessionId);
  if (!session) throw new AppError(httpStatus.NOT_FOUND, 'Support session not found');

  const updated = await SupportSession.findByIdAndUpdate(
    sessionId,
    { status, assignedAdmin: adminId },
    { new: true }
  )
    .populate('user', 'firstName lastName image memberNumber email role')
    .populate('assignedAdmin', 'firstName lastName image role');

  return updated;
};

export const SupportChatServices = {
  getOrCreateUserSupportSessionInDB,
  sendSupportMessageInDB,
  getSupportMessagesFromDB,
  getAllSupportSessionsForAdminFromDB,
  updateSupportSessionStatusInDB,
};
