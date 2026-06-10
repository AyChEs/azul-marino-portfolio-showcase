# Noor del Conocimiento — Mobile App

Islamic trivia quiz app — React Native / Expo SDK 52.

## Quick start

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go (Android/iOS) or press `a` for Android emulator.

## Environment

```bash
cp .env.example .env
# Add your ANTHROPIC_API_KEY (server-side only, never in APK)
```

## Build (EAS)

```bash
# Requires EXPO_TOKEN env var or eas login
eas build --platform android --profile preview   # APK
eas build --platform android --profile production # AAB for Play Store
```

## Project structure

```
app/              expo-router screens
  index.tsx       language select / onboarding
  home.tsx        mode/difficulty/category picker
  play.tsx        main game screen
  game-over.tsx   solo results
  majlis-setup.tsx  multiplayer lobby
  majlis-game-over.tsx  multiplayer results
components/
  ui/             AnswerOption, NoorButton, NoorCard, TimerBar, ...
  patterns/       IslamicPattern background SVG
constants/        colors.ts, i18n.ts
context/          LanguageContext
data/
  questions.json  507 verified questions (es/en/ma)
lib/
  gameLogic.ts    scoring, shuffling, question selection
  types.ts        shared TypeScript types
locales/          i18n strings (es/en/ma)
hooks/            usePlayedQuestions, useStats
```

## Questions

All 507 questions are human-verified with sources from quran.com, sunnah.com, and islamqa.info. Each entry has `verified: true`, `flag: false`, and a `source` citation.
