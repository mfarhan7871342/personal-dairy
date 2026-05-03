import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../utils/api';

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
  loading: boolean;
  fetchEntries: () => Promise<void>;
  addEntry: (entry: Omit<DiaryEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateEntry: (id: string, updates: Partial<DiaryEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  getEntry: (id: string) => DiaryEntry | undefined;
  getEntriesForDate: (date: string) => DiaryEntry[];
  getRecentEntries: (limit: number) => DiaryEntry[];
  toggleFavorite: (id: string) => Promise<void>;
  clearAll: () => void;
}

const mapBackendEntry = (e: any): DiaryEntry => ({
  ...e,
  id: e._id,
});

export const useEntryStore = create<EntryStore>()(
  persist(
    (set, get) => ({
      entries: [],
      loading: false,
      fetchEntries: async () => {
        set({ loading: true });
        try {
          const response = await api.get('/entries');
          const mappedEntries = response.data.map(mapBackendEntry);
          set({ entries: mappedEntries });
        } catch (error) {
          console.error('Failed to fetch entries', error);
        } finally {
          set({ loading: false });
        }
      },
      addEntry: async (entry) => {
        const response = await api.post('/entries', entry);
        const newEntry = mapBackendEntry(response.data);
        set((state) => ({ entries: [newEntry, ...state.entries] }));
        return newEntry.id;
      },
      updateEntry: async (id, updates) => {
        const response = await api.put(`/entries/${id}`, updates);
        const updatedEntry = mapBackendEntry(response.data);
        set((state) => ({
          entries: state.entries.map((e) => (e.id === id ? updatedEntry : e)),
        }));
      },
      deleteEntry: async (id) => {
        await api.delete(`/entries/${id}`);
        set((state) => ({ entries: state.entries.filter((e) => e.id !== id) }));
      },
      getEntry: (id) => get().entries.find((e) => e.id === id),
      getEntriesForDate: (date) =>
        get().entries.filter((e) => e.createdAt.startsWith(date)),
      getRecentEntries: (limit) => get().entries.slice(0, limit),
      toggleFavorite: async (id) => {
        const response = await api.patch(`/entries/${id}/favorite`);
        const updatedEntry = mapBackendEntry(response.data);
        set((state) => ({
          entries: state.entries.map((e) => (e.id === id ? updatedEntry : e)),
        }));
      },
      clearAll: () => set({ entries: [] }),
    }),
    { name: 'roz-entries', storage: createJSONStorage(() => AsyncStorage) }
  )
);
