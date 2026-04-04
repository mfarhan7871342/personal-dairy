# Roz — Daily Journal App

## Overview

A complete daily journaling Expo React Native app with mood tracking, streaks, AI companion, badges, themes, and more. Supports iOS, Android, and Web via React Native Web.

## Project Structure

```
app/
  _layout.tsx           — Root stack layout (GestureHandler + SafeAreaProvider)
  index.tsx             — Redirects to (tabs)
  lock.tsx              — PIN/Biometric lock screen
  write.tsx             — New/edit journal entry (modal)
  ai.tsx                — Roz AI companion chat (modal)
  themes.tsx            — Theme picker (modal)
  entry/[id].tsx        — Entry detail view
  (tabs)/
    _layout.tsx         — Tab navigator (5 tabs)
    index.tsx           — Home screen
    calendar.tsx        — Calendar view
    mood.tsx            — Mood tracker charts
    badges.tsx          — Badges/achievements
    settings.tsx        — App settings
    explore.tsx         — Hidden (redirects to home)

components/
  EntryCard.tsx         — Journal entry card
  MoodPicker.tsx        — 8-mood emoji picker
  StreakBanner.tsx      — Streak + total entries stats
  QuoteCard.tsx         — Daily inspirational quote
  BadgeItem.tsx         — Badge display with lock/unlock

constants/
  colors.ts             — 9 themes (light+dark), mood colors/icons
  theme.ts              — Legacy (unused)

hooks/
  useColors.ts          — Active theme colors hook

store/
  entryStore.ts         — Journal entries (Zustand + AsyncStorage persist)
  settingsStore.ts      — App settings (theme, lock, AI key, font size)
  streakStore.ts        — Streak data + 12 badge definitions

utils/
  biometric.native.ts   — expo-local-authentication (native only)
  biometric.web.ts      — Web stub (returns false)
```

## Tech Stack

- **Framework:** Expo SDK 54 with Expo Router 4
- **Language:** TypeScript
- **UI:** React Native + React Native Web
- **Navigation:** Expo Router (file-based)
- **State:** Zustand 5 + AsyncStorage persist
- **Animations:** React Native Reanimated 3
- **Package Manager:** npm

## Key Packages

- `zustand` — global state management with persistence
- `@react-native-async-storage/async-storage` — local storage
- `react-native-calendars` — calendar view
- `expo-local-authentication` — biometric/PIN (native only)
- `expo-image-picker` — photo attachments
- `expo-haptics` — tactile feedback
- `react-native-reanimated` — animations

## Workflows

- **Start Frontend** — `npx expo start --web --port 5000`

## Metro Configuration

`metro.config.js` has two critical settings:
1. `blockList` — excludes `.local/skills` and `.local/state` paths from being watched
2. `unstable_conditionNames: ['react-native', 'require', 'default']` — forces CJS resolution for packages like zustand that use ESM with `import.meta` (which Metro cannot parse on web)

## Platform Notes

- `expo-local-authentication` has NO web support — handled via platform-specific files (`utils/biometric.native.ts` / `utils/biometric.web.ts`)
- `FadeInDown` entering animations work on native; silently skipped on web
- Lock screen shows only when `settings.lockType !== 'none'` (default is 'none')

## Themes

9 built-in themes: `lavender`, `midnight`, `rose`, `forest`, `ocean`, `sunrise`, `slate`, `candy`, `paper` — each with light/dark variant

## AI Companion

Uses Claude API (claude-3-haiku-20240307) via direct fetch. User provides their own API key in Settings or the AI chat screen.

## Deployment

Configured as a static site:
- Build: `npx expo export --platform web`
- Output: `dist/`
