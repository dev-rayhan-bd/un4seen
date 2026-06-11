import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';

let io: Server;

export const initializeSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: "*", 
    },
  });

  io.on('connection', (socket) => {
    console.log('⚡ A user connected to socket:', socket.id);

    socket.on('disconnect', () => {
      console.log('❌ User disconnected');
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};