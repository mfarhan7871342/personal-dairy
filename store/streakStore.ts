import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const BADGE_DEFS = [
  { id: 'firstEntry', label: 'First Entry', desc: 'Wrote your first journal entry', icon: 'pencil', threshold: 1 },
  { id: 'streak3', label: '3-Day Streak', desc: 'Journaled 3 days in a row', icon: 'flame', threshold: 3 },
  { id: 'streak7', label: 'Week Warrior', desc: 'Journaled 7 days in a row', icon: 'trophy', threshold: 7 },
  { id: 'streak14', label: 'Fortnight', desc: 'Journaled 14 days in a row', icon: 'star', threshold: 14 },
  { id: 'streak30', label: 'Month Master', desc: 'Journaled 30 days in a row', icon: 'medal', threshold: 30 },
  { id: 'totalEntries10', label: 'Prolific Writer', desc: 'Wrote 10 journal entries', icon: 'book', threshold: 10 },
  { id: 'totalEntries50', label: 'Storyteller', desc: 'Wrote 50 journal entries', icon: 'library', threshold: 50 },
  { id: 'totalEntries100', label: 'Century', desc: 'Wrote 100 journal entries', icon: 'ribbon', threshold: 100 },
  { id: 'nightOwl', label: 'Night Owl', desc: 'Wrote an entry after 10pm', icon: 'moon', threshold: 1 },
  { id: 'earlyBird', label: 'Early Bird', desc: 'Wrote an entry before 7am', icon: 'sunny', threshold: 1 },
  { id: 'photographer', label: 'Photographer', desc: 'Added a photo to an entry', icon: 'camera', threshold: 1 },
  { id: 'aiExplorer', label: 'AI Explorer', desc: 'Used the AI companion', icon: 'sparkles', threshold: 1 },
];

interface StreakStore {
  currentStreak: number;
  longestStreak: number;
  lastEntryDate: string;
  totalEntries: number;
  unlockedBadges: string[];
  updateStreak: (entryDate: string, entry?: { photos: string[]; voiceUri?: string; hour?: number }) => string[];
  unlockBadge: (id: string) => boolean;
  resetAll: () => void;
}

const today = () => new Date().toISOString().split('T')[0];
const yesterday = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
};

export const useStreakStore = create<StreakStore>()(
  persist(
    (set, get) => ({
      currentStreak: 0,
      longestStreak: 0,
      lastEntryDate: '',
      totalEntries: 0,
      unlockedBadges: [],

      updateStreak: (entryDate, entry) => {
        const state = get();
        let newStreak = state.currentStreak;
        const newlyUnlocked: string[] = [];

        if (state.lastEntryDate === entryDate) {
          // Already journaled today
        } else if (state.lastEntryDate === yesterday()) {
          newStreak = state.currentStreak + 1;
        } else {
          newStreak = 1;
        }

        const newTotal = state.totalEntries + 1;
        const newLongest = Math.max(state.longestStreak, newStreak);

        // Check badges
        const check = (id: string) => {
          if (!state.unlockedBadges.includes(id)) {
            newlyUnlocked.push(id);
          }
        };

        if (newTotal === 1) check('firstEntry');
        if (newStreak >= 3) check('streak3');
        if (newStreak >= 7) check('streak7');
        if (newStreak >= 14) check('streak14');
        if (newStreak >= 30) check('streak30');
        if (newTotal >= 10) check('totalEntries10');
        if (newTotal >= 50) check('totalEntries50');
        if (newTotal >= 100) check('totalEntries100');
        if (entry?.photos && entry.photos.length > 0) check('photographer');
        if (entry?.hour !== undefined && entry.hour >= 22) check('nightOwl');
        if (entry?.hour !== undefined && entry.hour < 7) check('earlyBird');

        set({
          currentStreak: newStreak,
          longestStreak: newLongest,
          lastEntryDate: entryDate,
          totalEntries: newTotal,
          unlockedBadges: [...state.unlockedBadges, ...newlyUnlocked],
        });

        return newlyUnlocked;
      },

      unlockBadge: (id) => {
        const state = get();
        if (state.unlockedBadges.includes(id)) return false;
        set({ unlockedBadges: [...state.unlockedBadges, id] });
        return true;
      },

      resetAll: () =>
        set({ currentStreak: 0, longestStreak: 0, lastEntryDate: '', totalEntries: 0, unlockedBadges: [] }),
    }),
    { name: 'roz-streak', storage: createJSONStorage(() => AsyncStorage) }
  )
);
