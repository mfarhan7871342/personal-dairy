import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../utils/api';

interface User {
  _id: string;
  name: string;
  email: string;
  pin?: string;
  lockType?: string;
  theme?: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateTheme: (theme: string) => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        const { token, ...user } = response.data;
        set({ user, token, isAuthenticated: true });
      },
      register: async (name, email, password) => {
        const response = await api.post('/auth/register', { name, email, password });
        const { token, ...user } = response.data;
        set({ user, token, isAuthenticated: true });
      },
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },
      updateTheme: async (theme) => {
        await api.put('/settings/theme', { theme });
        set((state) => ({
          user: state.user ? { ...state.user, theme } : null,
        }));
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
