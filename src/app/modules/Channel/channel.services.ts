import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { Channel, Message, MessageReport } from './channel.model';
import QueryBuilder from '../../builder/QueryBuilder';

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
  return await Channel.create({
    ...payload,
    type: 'group',
    creator: userId,
    admins: [userId],
    members: [userId, ...payload.members]
  });
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
  let { channel, sender, text, file, to } = payload;


  if (!channel && to) {

    let chat = await Channel.findOne({
      type: 'private',
      members: { $all: [sender, to] }
    });

   
    if (!chat) {
      chat = await Channel.create({
        type: 'private',
        members: [sender, to]
      });
    }
    channel = chat._id;
  }

  const newMessage = await Message.create({
    channel, 
    sender,
    text,
    file
  });

  await Channel.findByIdAndUpdate(channel, { lastMessage: newMessage._id });

  return await newMessage.populate('sender', 'firstName lastName image memberNumber');
};


const getMessagesFromDB = async (channelId: string, query: Record<string, unknown>) => {
  const messageQuery = new QueryBuilder(
    Message.find({ channel: channelId, isDeleted: false }),
    query
  )
    .sort()     
    .paginate()  
    .fields();

  const result = await messageQuery.modelQuery.populate('sender', 'firstName lastName image memberNumber');
  const meta = await messageQuery.countTotal();

  return { meta, result };
};

export const ChannelServices = { 
  getOrCreatePrivateChatInDB, 
  createGroupInDB, 
  getMyChatListFromDB, 
  getMessagesFromDB,
  reportMessageInDB ,
  createMessageInDB
};