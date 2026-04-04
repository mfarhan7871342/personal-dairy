# my-app — Expo React Native App

## Overview

This is a default Expo (React Native) starter project using Expo Router for file-based navigation. It supports iOS, Android, and Web via React Native Web.

## Project Structure

- `app/` — Expo Router screens and layouts
  - `_layout.tsx` — Root layout
  - `(tabs)/` — Tab-based navigation group
  - `modal.tsx` — Modal screen
- `components/` — Shared UI components
- `constants/` — Theme constants
- `hooks/` — Custom React hooks
- `assets/` — Static assets (images, fonts)
- `scripts/` — Utility scripts

## Tech Stack

- **Framework:** Expo SDK 54 with Expo Router 6
- **Language:** TypeScript
- **UI:** React Native + React Native Web
- **Navigation:** Expo Router (file-based)
- **Package Manager:** npm

## Workflows

- **Start Frontend** — Runs `npx expo start --web --port 8080` (Expo dev server on port 8080)

## Deployment

Configured as a static site:
- Build: `npx expo export --platform web`
- Output: `dist/`

## Notes

- The Expo app runs in the browser on port 8080 via React Native Web
- Scan the QR code from the Expo dev server console to test on a physical device via Expo Go
- Hot Module Reloading (HMR) is enabled — no workflow restart needed for most code changes
