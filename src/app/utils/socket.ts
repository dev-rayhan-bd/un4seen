import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { verifyToken } from '../modules/Auth/auth.utils';
import config from '../config';
import { ChannelServices } from '../modules/Channel/channel.services';
import { UserModel } from '../modules/User/user.model';

let io: Server;
const onlineUsers = new Set<string>(); 

export const initializeSocket = (server: HttpServer) => {
  io = new Server(server, { cors: { origin: "*" } });


  io.use((socket, next) => {
    const token = socket.handshake.query.token as string;
    if (!token) return next(new Error('Auth error: Token missing'));
    try {
      const decoded = verifyToken(token, config.jwt_access_secret as string);
      socket.data.user = decoded; 
      next();
    } catch (err) {
      next(new Error('Auth error: Invalid token'));
    }
  });

  io.on('connection',async (socket) => {
    const myId = socket.data.user.userId;
    onlineUsers.add(myId);
    socket.join(myId);


 
  await UserModel.findByIdAndUpdate(myId, { isOnline: true });

    socket.emit('GET_ONLINE_USERS', Array.from(onlineUsers)); 
    socket.broadcast.emit('USER_STATUS_CHANGED', { userId: myId,isOnline: true }); 

    console.log(`✅ User ${myId} connected`);


    socket.on('SEND_PRIVATE_MESSAGE', async (data: { to: string; text: string; file?: string }) => {
      try {
        const { to, text, file } = data;
        const populatedMsg = await ChannelServices.createMessageInDB({
          sender: myId, to, text, file, type: 'private'
        } as any);

 
        io.to(to).emit('RECEIVE_PRIVATE_MESSAGE', populatedMsg);
        socket.emit('RECEIVE_PRIVATE_MESSAGE', populatedMsg);
      } catch (error: any) {
        socket.emit('ERROR', { message: error.message });
      }
    });

    socket.on('JOIN_CHANNEL', (channelId: string) => {
      socket.join(channelId);
      console.log(`👥 Joined Group: ${channelId}`);
    });

    socket.on('SEND_GROUP_MESSAGE', async (data: { channelId: string; text: string; file?: string }) => {
      try {
        const { channelId, text, file } = data;
        const populatedMsg = await ChannelServices.createMessageInDB({
          channel: channelId, sender: myId, text, file, type: 'group'
        } as any);


        io.to(channelId).emit('RECEIVE_GROUP_MESSAGE', populatedMsg);
      } catch (error: any) {
        socket.emit('ERROR', { message: error.message });
      }
    });


    socket.on('START_TYPING', (data: { targetId: string; isGroup: boolean }) => {
      socket.to(data.targetId).emit('USER_TYPING', { userId: myId, isGroup: data.isGroup });
    });

    socket.on('STOP_TYPING', (targetId: string) => {
      socket.to(targetId).emit('USER_STOP_TYPING', { userId: myId });
    });

    socket.on('disconnect', () => {
      onlineUsers.delete(myId);
      io.emit('USER_STATUS_CHANGED', { userId: myId, isOnline: false });
      console.log('❌ User disconnected');
    });
  });

  return io;
};

export const getIO = () => io;