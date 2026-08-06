# Mobile First Steps

As of — 2026-08-04

The first three work sessions, concretely. This is the on-ramp into `development_plan.md` (phases 0–1); once these are done, work continues from the plan's phase 2 slices and this doc is historical.

## Session 1 — backend groundwork (Laravel repo)

The true starting point: everything in the app depends on it, no mobile knowledge required, fully verifiable with the existing test suite before the app ever calls it.

1. `composer require laravel/sanctum` + its migration (personal access tokens table).
2. `/api/v1` route group in `routes/web.php`:
   - `POST /api/v1/login` — email/password → `$user->createToken($deviceName)` → token + user payload
   - `POST /api/v1/logout` — revoke the current token
   - `GET /api/v1/user` — behind `auth:sanctum`
3. `GET /api/v1/app-config` → `{ min_app_version, force_upgrade, features: {} }`. Trivial now, painful to retrofit.
4. Mobile throttle limits on login/register — no Turnstile on mobile, so throttles carry the weight.
5. Start `docs/api/mobile_v1.md` (in the Laravel repo) documenting exactly these endpoints; tests written alongside.

Exit: token flow exercised by the test suite.

## Session 2 — make the app yours (this repo)

No API needed; all visual; builds RN comfort.

1. Remove the scaffold's `example/` leftovers.
2. `src/theme/tokens.ts` — port the palette from the web repo's `docs/frontend/dark_mode.md`, wire `useColorScheme` so light/dark works from the first component. Tokens only, no literal colors anywhere.
3. Tab shell: expo-router `(tabs)` layout — Today / Repertoire / Tools / Settings (working names) — each tab wrapping a native stack, placeholder screens with large titles.

Exit: shell runs in Expo Go and the native-stack feel (swipe-back, large-title collapse) is visible on-device.

## Session 3 — connect them

1. `src/api/client.ts` (all requests through it, Bearer header, 401 → purge token + redirect to login) + `expo-secure-store` for the token + TanStack Query setup.
2. Login screen — native form, keyboard avoidance — hitting the local Laravel server.
3. Wire Today's header to `GET /api/v1/user`.

Exit (= phase 1 exit): sign in on the real iPhone, see your name on Today, kill the app, reopen, still signed in.

## Local-network gotchas (session 3)

- The phone can't reach `localhost` on the PC. Bind Laravel to the LAN: `php artisan serve --host=0.0.0.0`, and point the app's base URL at `http://192.168.x.x:8000`.
- Allow PHP/Laravel through Windows Defender Firewall (same as was needed for Node/Expo).
- iOS blocks plain HTTP by default but exempts local-network addresses, so the LAN IP works in dev. If connections mysteriously fail, check this and the firewall first.
- Both devices on the same Wi-Fi; if the router isolates clients, Expo's `--tunnel` trick doesn't help the *API* — the phone still needs LAN access to Laravel.
