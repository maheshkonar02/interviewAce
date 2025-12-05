import { create } from 'zustand';
import api from '../utils/api';

// Simple localStorage persistence
const loadState = () => {
  try {
    const serializedState = localStorage.getItem('auth-storage');
    if (serializedState === null) {
      return { user: null, token: null, isAuthenticated: false };
    }
    return JSON.parse(serializedState);
  } catch (err) {
    return { user: null, token: null, isAuthenticated: false };
  }
};

const saveState = (state) => {
  try {
    const serializedState = JSON.stringify({
      user: state.user,
      token: state.token,
      isAuthenticated: state.isAuthenticated
    });
    localStorage.setItem('auth-storage', serializedState);
  } catch (err) {
    console.error('Error saving auth state:', err);
  }
};

export const useAuthStore = create((set) => {
  const initialState = loadState();

  // Initialize API token if exists
  if (initialState.token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${initialState.token}`;
  }

  return {
    ...initialState,

    login: async (email, password) => {
      try {
        const response = await api.post('/auth/login', { email, password });
        const { user, token } = response.data.data;

        const newState = {
          user,
          token,
          isAuthenticated: true
        };

        set(newState);
        saveState(newState);

        // Set token in API client
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.error || 'Login failed'
        };
      }
    },

    register: async (email, password, name) => {
      try {
        const response = await api.post('/auth/register', {
          email,
          password,
          name
        });
        const { user, token } = response.data.data;

        const newState = {
          user,
          token,
          isAuthenticated: true
        };

        set(newState);
        saveState(newState);

        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.error || 'Registration failed'
        };
      }
    },

    logout: () => {
      const newState = {
        user: null,
        token: null,
        isAuthenticated: false
      };
      set(newState);
      saveState(newState);
      delete api.defaults.headers.common['Authorization'];
    },

    updateUser: (userData) => {
      set((state) => {
        const updatedUser = { ...state.user, ...userData };
        const newState = { ...state, user: updatedUser };
        saveState(newState);
        return newState;
      });
    },

    fetchUser: async () => {
      try {
        const response = await api.get('/auth/me');
        const user = response.data.data.user;
        
        set((state) => {
          const newState = {
            ...state,
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              credits: user.credits,
              preferences: user.preferences,
              resume: user.resume
            }
          };
          saveState(newState);
          return newState;
        });

        return { success: true, user };
      } catch (error) {
        console.error('Error fetching user:', error);
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to fetch user'
        };
      }
    }
  };
}
);

