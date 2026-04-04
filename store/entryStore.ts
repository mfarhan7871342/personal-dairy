import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type MoodType = 'happy' | 'sad' | 'anxious' | 'excited' | 'calm' | 'angry' | 'grateful' | 'neutral';

export interface DiaryEntry {
  id: string;
  title: string;
  body: string;
  mood: MoodType;
  photos: string[];
  voiceUri?: string;
  voiceDuration?: number;
  createdAt: string;
  updatedAt: string;
  themeId: string;
  isFavorite: boolean;
  tags: string[];
}

interface EntryStore {
  entries: DiaryEntry[];
  addEntry: (entry: Omit<DiaryEntry, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateEntry: (id: string, updates: Partial<DiaryEntry>) => void;
  deleteEntry: (id: string) => void;
  getEntry: (id: string) => DiaryEntry | undefined;
  getEntriesForDate: (date: string) => DiaryEntry[];
  getRecentEntries: (limit: number) => DiaryEntry[];
  toggleFavorite: (id: string) => void;
  clearAll: () => void;
}

const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

export const useEntryStore = create<EntryStore>()(
  persist(
    (set, get) => ({
      entries: [],
      addEntry: (entry) => {
        const id = generateId();
        const now = new Date().toISOString();
        const newEntry: DiaryEntry = { ...entry, id, createdAt: now, updatedAt: now };
        set((state) => ({ entries: [newEntry, ...state.entries] }));
        return id;
      },
      updateEntry: (id, updates) => {
        set((state) => ({
          entries: state.entries.map((e) =>
            e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e
          ),
        }));
      },
      deleteEntry: (id) => {
        set((state) => ({ entries: state.entries.filter((e) => e.id !== id) }));
      },
      getEntry: (id) => get().entries.find((e) => e.id === id),
      getEntriesForDate: (date) =>
        get().entries.filter((e) => e.createdAt.startsWith(date)),
      getRecentEntries: (limit) => get().entries.slice(0, limit),
      toggleFavorite: (id) => {
        set((state) => ({
          entries: state.entries.map((e) =>
            e.id === id ? { ...e, isFavorite: !e.isFavorite } : e
          ),
        }));
      },
      clearAll: () => set({ entries: [] }),
    }),
    { name: 'roz-entries', storage: createJSONStorage(() => AsyncStorage) }
  )
);
