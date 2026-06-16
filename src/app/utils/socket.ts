import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { verifyToken } from '../modules/Auth/auth.utils';
import config from '../config';
import { ChannelServices } from '../modules/Channel/channel.services'; 

let io: Server;

export const initializeSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: { origin: "*" },
  });

  io.use((socket, next) => {
    const token = socket.handshake.query.token as string;
    if (!token) return next(new Error('Authentication error: Token missing'));

    try {
      const decoded = verifyToken(token, config.jwt_access_secret as string);
      socket.data.user = decoded; 
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.user.userId;
    console.log('✅ User Authenticated:', userId);

    socket.join(userId);


    socket.on('JOIN_CHANNEL', (channelId: string) => {
      socket.join(channelId);
      console.log(`User joined channel room: ${channelId}`);
    });

    // (Text + Attachment Support) ---
  socket.on('SEND_PRIVATE_MESSAGE', async (data: { to: string; text: string; file?: string }) => {
  try {
    const { to, text, file } = data;
    const myId = socket.data.user.userId;

    console.log(`📩 Message from ${myId} to ${to}`);

    const populatedMsg = await ChannelServices.createMessageInDB({
      sender: myId,
      to: to,
      text: text,
      file: file,
      type: 'private'
    } as any);

    console.log("✅ Message saved in DB");

    io.to(to).emit('RECEIVE_MESSAGE', populatedMsg);
    
    socket.emit('RECEIVE_MESSAGE', populatedMsg);
    
    console.log("🚀 Message Emitted Successfully");

  } catch (error: any) {
    console.error("❌ SOCKET ERROR:", error.message);
    socket.emit('ERROR', { message: "Failed to send message", detail: error.message });
  }
});


    socket.on('TYPING', (data: { channel: string; userName: string }) => {
      socket.to(data.channel).emit('USER_TYPING', { 
        channel: data.channel, 
        user: data.userName 
      });
    });

    socket.on('STOP_TYPING', (channelId: string) => {
      socket.to(channelId).emit('USER_STOP_TYPING', channelId);
    });

  
    socket.broadcast.emit('USER_STATUS', { userId, status: 'online' });

    socket.on('disconnect', () => {
      socket.broadcast.emit('USER_STATUS', { userId, status: 'offline' });
      console.log('❌ User disconnected');
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized!');
  return io;
};