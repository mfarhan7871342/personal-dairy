import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../utils/api';

export type LockType = 'none' | 'pin' | 'biometrics';
export type FontSize = 'small' | 'medium' | 'large';

export interface UserSettings {
  lockType: LockType;
  pin: string;
  reminderEnabled: boolean;
  reminderTime: string;
  themeId: string;
  fontSize: FontSize;
  userName: string;
  aiApiKey: string;
  isLocked: boolean;
}

interface SettingsStore {
  settings: UserSettings;
  loading: boolean;
  fetchSettings: () => Promise<void>;
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>;
  lock: () => void;
  unlock: () => void;
}

const defaults: UserSettings = {
  lockType: 'none',
  pin: '',
  reminderEnabled: false,
  reminderTime: '20:00',
  themeId: 'lavender',
  fontSize: 'medium',
  userName: '',
  aiApiKey: '',
  isLocked: false,
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      settings: defaults,
      loading: false,
      fetchSettings: async () => {
        set({ loading: true });
        try {
          const response = await api.get('/settings');
          const { name, theme, lockType } = response.data;
          set((state) => ({
            settings: {
              ...state.settings,
              userName: name || state.settings.userName,
              themeId: theme || state.settings.themeId,
              lockType: lockType || state.settings.lockType,
            },
          }));
        } catch (error) {
          console.error('Failed to fetch settings', error);
        } finally {
          set({ loading: false });
        }
      },
      updateSettings: async (updates) => {
        // Optimistic update
        const previousSettings = get().settings;
        set((state) => ({ settings: { ...state.settings, ...updates } }));

        try {
          if (updates.userName !== undefined) {
            await api.put('/settings/profile', { name: updates.userName });
          }
          if (updates.themeId !== undefined) {
            await api.put('/settings/theme', { theme: updates.themeId });
          }
          if (updates.lockType !== undefined || updates.pin !== undefined) {
            await api.put('/settings/lock', { 
              lockType: updates.lockType ?? previousSettings.lockType, 
              pin: updates.pin ?? previousSettings.pin 
            });
          }
        } catch (error) {
          console.error('Failed to sync settings', error);
          // Rollback on failure
          set({ settings: previousSettings });
        }
      },
      lock: () => set((state) => ({ settings: { ...state.settings, isLocked: true } })),
      unlock: () => set((state) => ({ settings: { ...state.settings, isLocked: false } })),
    }),
    { name: 'roz-settings', storage: createJSONStorage(() => AsyncStorage) }
  )
);
