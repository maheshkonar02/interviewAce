import { io } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';

let socket = null;

// Get backend URL from environment or use localhost for development
const getBackendUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl) {
    // Extract base URL from API URL (remove /api if present)
    return apiUrl.replace('/api', '');
  }
  return 'http://localhost:3001';
};

export const connectSocket = (sessionId) => {
  const { token, user } = useAuthStore.getState();

  if (socket?.connected) {
    return socket;
  }

  socket = io(getBackendUrl(), {
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

