import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { Channel, Message, MessageReport } from './channel.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { JoinRequest } from './joinRequest.model';
import { sendNotification } from '../../utils/sendNotification';
import { Types } from 'mongoose';
import { UserModel } from '../User/user.model';

const getOrCreatePrivateChatInDB = async (userId: string, targetId: string) => {
  if (userId === targetId) throw new AppError(400, "You cannot chat with yourself");
  let chat = await Channel.findOne({
    type: 'private',
    members: { $all: [userId, targetId] }
  }).populate('members', 'firstName lastName image status');

  if (!chat) {
    chat = await Channel.create({
      type: 'private',
      members: [userId, targetId]
    });
  }
  return chat;
};

const createGroupInDB = async (userId: string, payload: any) => {

  const memberList = [new Types.ObjectId(userId)]; 
  
  if (payload.members && Array.isArray(payload.members)) {
    payload.members.forEach((id: string) => {
      memberList.push(new Types.ObjectId(id));
    });
  }


  const result = await Channel.create({
    name: payload.name,
    description: payload.description,
    isPrivate: payload.isPrivate,
    type: 'group',
    creator: userId,
    admins: [new Types.ObjectId(userId)],
    members: memberList,
  });

  return result;
};

const getMyChatListFromDB = async (userId: string) => {
  const chats = await Channel.find({ members: userId, isDeleted: false })
    .populate('members', 'firstName lastName image status')
    .populate('lastMessage')
    .sort('-updatedAt');

  return await Promise.all(chats.map(async (chat) => {
    const chatObj = chat.toObject() as any;
    const otherUser = chat.type === 'private' 
      ? chatObj.members.find((m: any) => m._id.toString() !== userId) 
      : null;

    const unreadCount = await Message.countDocuments({
      channel: chat._id,
      sender: { $ne: userId },
      isRead: false
    });

    return {
      ...chatObj,
      chatName: otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : chat.name,
      chatImage: otherUser ? otherUser.image : chat.image,
      lastMessage: chatObj.lastMessage?.text || (chatObj.lastMessage?.file ? "Sent a file" : "Start chatting"),
      lastMessageTime: chatObj.lastMessage?.createdAt || chat.updatedAt,
      unreadCount,
      isOnline: otherUser ? otherUser.status === 'active' : false
    };
  }));
};



const reportMessageInDB = async (userId: string, payload: any) => {
  const result = await MessageReport.create({ ...payload, reporter: userId });
  await Message.findByIdAndUpdate(payload.message, { isReported: true });
  return result;
};

const createMessageInDB = async (payload: any) => {
  let { channel, sender, text, file, to, type } = payload;


  if (type === 'private' && !channel && to) {
    let chat = await Channel.findOne({
      type: 'private',
      members: { $all: [sender, to] }
    });

    if (!chat) {
      chat = await Channel.create({ type: 'private', members: [sender, to] });
    }
    channel = chat._id;
  }

  const newMessage = await Message.create({ channel, sender, text, file });
  await Channel.findByIdAndUpdate(channel, { lastMessage: newMessage._id });

  const populated = await newMessage.populate('sender', 'firstName lastName image memberNumber');

  // --- Push Notification ---
  try {
    const senderUser = await UserModel.findById(sender).select('firstName lastName');
    const senderName = senderUser ? `${senderUser.firstName} ${senderUser.lastName}` : 'Someone';

    if (type === 'private' && to) {
      // Private message: notify the recipient
      const msgText = text || 'Sent a photo';
      await sendNotification(to, senderName, msgText, 'message');
    } else if (type === 'group') {
      // Group message: notify all members except sender
      const channelDoc = await Channel.findById(channel).select('members name');
      if (channelDoc) {
        const msgText = text || 'Sent a photo';
        const groupName = channelDoc.name || 'Group';
        const recipients = channelDoc.members.filter(
          (m: any) => m.toString() !== sender.toString()
        );
        for (const memberId of recipients) {
          await sendNotification(memberId.toString(), groupName, `${senderName}: ${msgText}`, 'message');
        }
      }
    }
  } catch (notifError) {
    console.error('Failed to send push notification:', notifError);
  }

  return populated;
};

const getMessagesFromDB = async (channelId: string, query: Record<string, unknown>) => {

  const channelObjectId = new Types.ObjectId(channelId);

  const messageQuery = new QueryBuilder(

    Message.find({ channel: channelObjectId, isDeleted: { $ne: true } }), 
    query
  )
    .sort() 
    .paginate()
    .fields();

  const result = await messageQuery.modelQuery.populate('sender', 'firstName lastName image memberNumber');
  const meta = await messageQuery.countTotal();

  return { meta, result };
};

const getMyJoinedChannelsFromDB = async (userId: string) => {
  const allChannels = await Channel.find({ 
    members: userId, 
    isDeleted: false 
  }).populate('members', 'firstName lastName image isOnline memberNumber');

  const groups: any[] = [];
  const directMessages: any[] = [];

  allChannels.forEach(channel => {
    const channelObj = channel.toObject() as any;
    

    const onlineCount = channel.members.filter((m: any) => m.isOnline === true).length;

    if (channel.type === 'group') {
      groups.push({
        _id: channelObj._id,
        name: channelObj.name,
        image: channelObj.image,
        onlineCount,
        isPrivate: channelObj.isPrivate
      });
    } else {
      const otherUser = channelObj.members.find((m: any) => m._id.toString() !== userId);
      if (otherUser) {
        directMessages.push({
          _id: channelObj._id,
          userId: otherUser._id,
          name: `${otherUser.firstName} ${otherUser.lastName}`,
          image: otherUser.image,
          isOnline: otherUser.isOnline, 
          type: 'private'
        });
      }
    }
  });

  return { groups, directMessages };
};

const searchAllChannelsFromDB = async (userId: string, searchTerm: string) => {
  const channels = await Channel.find({
    name: { $regex: searchTerm, $options: 'i' },
    type: 'group',
    isDeleted: false
  }).populate('members', 'status');


  const pendingRequests = await JoinRequest.find({ user: userId, status: 'pending' }).distinct('channel');

  return channels.map(channel => {
    const isJoined = channel.members.some(m => m._id.toString() === userId);
    const isPending = pendingRequests.some(reqId => reqId.toString() === channel._id.toString());
    const onlineCount = channel.members.filter((m: any) => m.status === 'active').length;

    return {
      _id: channel._id,
      name: channel.name,
      image: channel.image,
      onlineCount,
      isJoined, 
      isPending,
      isPrivate: channel.isPrivate
    };
  });
};


const sendJoinRequestInDB = async (userId: string, channelId: string) => {

    const channel = await Channel.findById(channelId);
    if (channel?.members.includes(userId as any)) throw new AppError(400, "Already a member");

    return await JoinRequest.create({ user: userId, channel: channelId });
};
const getChannelRequestsFromDB = async (adminId: string, channelId: string) => {
  const channel = await Channel.findOne({ _id: channelId, admins: adminId });
  if (!channel) throw new AppError(403, "You are not an admin of this channel");

  return await JoinRequest.find({ channel: channelId, status: 'pending' })
    .populate('user', 'firstName lastName image memberNumber');
};

const handleJoinRequestInDB = async (adminId: string, requestId: string, status: 'accepted' | 'rejected') => {
  const request = await JoinRequest.findById(requestId).populate('channel');
  if (!request) throw new AppError(404, "Request not found");

  const channel = await Channel.findById(request.channel);

  if (!channel?.admins.includes(adminId as any)) {
    throw new AppError(403, "Only channel admins can perform this action");
  }

  request.status = status;
  await request.save();

  if (status === 'accepted') {

    await Channel.findByIdAndUpdate(channel._id, {
      $addToSet: { members: request.user }
    });

    await sendNotification(
      request.user.toString(),
      'Join Request Accepted! 🎉',
      `You are now a member of ${channel.name}. Happy chatting!`,
      'general'
    );
  }

  return request;
};
const searchRidersFromDB = async (searchTerm: string, currentUserId: string) => {
  console.log("Searching for:", searchTerm);

  const query: any = {
    _id: { $ne: currentUserId },

    isDeleted: { $ne: true } 
  };

  if (searchTerm) {
    const cleanSearch = searchTerm.trim().replace('#', '');
    query.$or = [
      { firstName: { $regex: cleanSearch, $options: 'i' } },
      { lastName: { $regex: cleanSearch, $options: 'i' } },
      { fullName: { $regex: cleanSearch, $options: 'i' } },
      { memberNumber: { $regex: cleanSearch, $options: 'i' } }
    ];
  }

  const users = await UserModel.find(query)
    .select('firstName lastName fullName image status memberNumber')
    .limit(20);

  return users;
};
const getPrivateChatHistoryFromDB = async (userId: string, otherUserId: string, query: Record<string, unknown>) => {

  const chat = await Channel.findOne({
    type: 'private',
    members: { $all: [userId, otherUserId] }
  });

  if (!chat) {
    return {
      meta: { page: 1, limit: 10, total: 0, totalPage: 0 },
      result: []
    };
  }
  return await ChannelServices.getMessagesFromDB(chat._id.toString(), query);
};

const getChannelMembersFromDB = async (channelId: string) => {
  const channel = await Channel.findById(channelId).populate('members', 'firstName lastName image memberNumber isOnline status');

  if (!channel) {
    throw new AppError(httpStatus.NOT_FOUND, 'Channel not found');
  }


  const membersWithAdminStatus = channel.members.map((member: any) => {
    const memberObj = member.toObject();
    return {
      ...memberObj,
      isAdmin: channel.admins.some((adminId) => adminId.toString() === member._id.toString()),
    };
  });

  return membersWithAdminStatus;
};
const toggleMemberInChannelInDB = async (
  adminId: string, 
  payload: { channelId: string; targetUserId: string; action: 'add' | 'remove' }
) => {
  const { channelId, targetUserId, action } = payload;

  const channel = await Channel.findOne({ _id: channelId, admins: adminId });
  
  if (!channel) {
    throw new AppError(httpStatus.FORBIDDEN, "Only channel admins can manage members!");
  }


  let updateQuery;
  if (action === 'add') {
    updateQuery = { $addToSet: { members: targetUserId } };
  } else {
   
    if (adminId === targetUserId) {
        throw new AppError(httpStatus.BAD_REQUEST, "Admin cannot remove themselves!");
    }
    updateQuery = { $pull: { members: targetUserId, admins: targetUserId } }; 
  }

  const result = await Channel.findByIdAndUpdate(channelId, updateQuery, { new: true })
    .populate('members', 'firstName lastName image memberNumber');

  return result;
};
// const getAllReportsFromDB = async (query: Record<string, unknown>) => {
//   const reportQuery = new QueryBuilder(
//     MessageReport.find()
//       .populate('reporter', 'firstName lastName email image') 
//       .populate({
//         path: 'message',
//         populate: { path: 'sender', select: 'firstName lastName email image' } //(Reported User)
//       }),
//     query
//   )
//   .search(['reason'])
//     .sort()
//     .paginate();

//   const reports = await reportQuery.modelQuery;
//   const meta = await reportQuery.countTotal();


//   const result = reports.map((report: any) => ({
//     _id: report._id,
//     reporter: report.reporter, // UI Column 1
//     reportedUser: report.message?.sender || null, // UI Column 2
//     type: 'MESSAGE', // UI Column 3 (Hardcoded as requested)
//     reason: report.reason, // UI Column 4
//     status: report.status,
//     createdAt: report.createdAt
//   }));

//   return { meta, result };
// };
const getAllReportsFromDB = async (query: Record<string, unknown>) => {
  const reportQuery = new QueryBuilder(
    MessageReport.find()
      .populate('reporter', 'firstName lastName email fullName image')
      .populate({
        path: 'message',
        populate: { path: 'sender', select: 'firstName lastName email fullName image' }
      }),
    query
  )
    .sort()
    .paginate();

  const reports = await reportQuery.modelQuery;
  const meta = await reportQuery.countTotal();

  const result = reports.map((report: any) => ({
    _id: report._id,
    reporter: report.reporter, // UI: Reporter Section
    reportedUser: report.message?.sender || null, // UI: Reported User Section


    violationContent: report.message?.text 
      ? report.message.text 
      : (report.message?.file ? report.message.file : "Message content unavailable"),
      

    reporterComment: report.details || "No specific comment provided by reporter",
    
    type: report.reportType || 'MESSAGE',
    reason: report.reason,
    status: report.status,
    createdAt: report.createdAt
  }));

  return { meta, result };
};
const resolveReportInDB = async (id: string) => {
  return await MessageReport.findByIdAndUpdate(id, { status: 'resolved' }, { new: true });
};
export const ChannelServices = { 
  getOrCreatePrivateChatInDB, 
  createGroupInDB, 
  getMyChatListFromDB, 
  getMessagesFromDB,
  reportMessageInDB ,
  createMessageInDB,
  searchAllChannelsFromDB,
  sendJoinRequestInDB,getMyJoinedChannelsFromDB,
  getChannelRequestsFromDB,handleJoinRequestInDB,searchRidersFromDB,getPrivateChatHistoryFromDB,getChannelMembersFromDB,toggleMemberInChannelInDB,getAllReportsFromDB,resolveReportInDB

};