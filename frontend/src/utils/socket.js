import { io } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';

let socket = null;

export const connectSocket = (sessionId) => {
  const { token, user } = useAuthStore.getState();
  
  if (socket?.connected) {
    return socket;
  }

  socket = io('http://localhost:3001', {
    auth: {
      token,
      userId: user?.id
    },
    transports: ['websocket']
  });

  socket.on('connect', () => {
    console.log('Socket connected');
    socket.emit('authenticate', {
      token,
      userId: user?.id,
      sessionId
    });
  });

  socket.on('authenticated', () => {
    console.log('Socket authenticated');
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;

