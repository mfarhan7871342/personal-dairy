import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  updateSettings: (updates: Partial<UserSettings>) => void;
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
    (set) => ({
      settings: defaults,
      updateSettings: (updates) =>
        set((state) => ({ settings: { ...state.settings, ...updates } })),
      lock: () => set((state) => ({ settings: { ...state.settings, isLocked: true } })),
      unlock: () => set((state) => ({ settings: { ...state.settings, isLocked: false } })),
    }),
    { name: 'roz-settings', storage: createJSONStorage(() => AsyncStorage) }
  )
);
