# CLAUDE.md

As of — 2026-08-03

PieceKeeper's native iOS app. React Native + Expo (SDK 57), TypeScript, expo-router.

- The Laravel backend + Vue web app live at `d:\GitHub\PieceKeeper` — add via /add-dir.
  API routes: `routes/web.php`. Feature docs: `docs/`. Plan + native-feel rules:
  `docs/plans/mobile_app.md` (follow its "Making RN actually feel native" section).
- Design each screen from iOS conventions, never port web layouts.
- Dev loop: `npx expo start` + the **EAS development build** (expo-dev-client) installed on a
  physical iPhone — not Expo Go. No local iOS builds (Windows). JS changes hot-reload; adding
  a library with native code requires a fresh build:
  `npx eas-cli build --profile development --platform ios`
