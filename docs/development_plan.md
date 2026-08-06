# Development Plan

As of — 2026-08-04

How we build the PieceKeeper iOS app in an organized way. The *technical decisions* (stack, backend approach, native-feel rules) live in the backend repo at `d:\GitHub\PieceKeeper\docs\plans\mobile_app.md` and are not restated here; this doc is the working process and build order. Read both before starting significant work.

**Scope stance:** the long-term target is parity with the web app wherever a feature makes sense on a phone. No web feature is banned from mobile. The phase order below is *sequencing* — the shortest path to a genuinely native, daily-useful app — not a feature cut list. What comes after the core is decided later, deliberately.

## 1. The reuse rules

The web app (Vue SPA, `d:\GitHub\PieceKeeper`) is a reference, not a source. Three tiers, applied strictly:

**Tier 1 — copy directly.** Framework-free assets and logic:
- Design token *values* from `docs/frontend/dark_mode.md` (colors only; spacing/typography are re-decided for iOS).
- Plain-JS logic modules with no Vue imports (e.g. `resources/js/lib/staveRender.js`, `resources/js/data/learn/*`) if a future slice ever needs them. Copy the file, keep a header comment naming its source path.
- Server-hosted assets (soundfont samples, sprite SVGs) — consumed via URL, nothing to port.

**Tier 2 — read for behavior, never for markup.** Vue components are the spec for *what happens*: states, business rules, edge cases, user-facing copy, API call sequences. When building a screen, read its Vue counterpart and extract: which endpoints it calls and when, what states it can be in (see `docs/frontend/frontend-data-map.md` — e.g. dashboard's `session / rest_day / no_pieces / needs_schedule / needs_anchor`), what validation and error copy exist. Then design the screen fresh from iOS conventions.

**Tier 3 — never port.** Templates, Tailwind classes, layouts, web navigation patterns, modal structures. If you find yourself translating a `<div>` tree, stop. The native-feel rules in `mobile_app.md` ("Making RN actually feel native") govern all UI and win every conflict.

## 2. Architecture

### Folder layout

```
app/                    # expo-router route files ONLY — thin wrappers that render a feature screen
  (auth)/               #   login, register, forgot-password
  (tabs)/               #   the signed-in tab shell
src/
  api/                  # client.ts + one typed module per resource (dashboard.ts, pieces.ts, auth.ts)
  features/             # screen-level components by domain: dashboard/, session/, repertoire/, settings/
  components/           # shared primitives (buttons, list rows, skeletons, empty states)
  theme/                # tokens.ts (palette from dark_mode.md), typography, spacing
  lib/                  # framework-free logic (Tier-1 copies live here, marked with source path)
```

Route files stay skeletal; real screens live in `src/features/`. This mirrors the web repo's controllers-thin / services-fat convention.

### API layer

Same discipline as the web's `api.js` rule: **every network call goes through `src/api/client.ts`** — never raw `fetch` in a component. The client owns: base URL (from app config/env), `Authorization: Bearer` header from `expo-secure-store`, JSON handling, 401 → token purge + redirect to login, and a single error shape.

On top of the client, use **TanStack Query** (`@tanstack/react-query`) for server state: caching, pull-to-refresh wiring, and optimistic updates (checklist ticks must flip instantly — perceived latency is the #1 wrapper tell). Local UI state stays in components; no global state library until something actually demands it.

Every payload gets a TypeScript interface in the resource's api module, hand-written from the API contract doc (below). If a field isn't in the contract doc, the app doesn't read it.

### Libraries

Already scaffolded: expo-router, reanimated, gesture-handler, expo-symbols. Add via `npx expo install` only when a slice needs them: `expo-secure-store` (phase 1), `@tanstack/react-query` (phase 1), `@shopify/flash-list` (repertoire slice), `expo-haptics` (polish), `expo-notifications`, `expo-audio` (phase 5). Nothing speculative.

### Theme

`src/theme/tokens.ts` ports the palette from the web's `dark_mode.md` once; after that, mobile tokens are authoritative for mobile. Light/dark follows the system via `useColorScheme` from day one — every component reads tokens, never literal colors, so there is no "dark mode pass" later.

## 3. The API contract

The backend repo is the source of truth. Process:

- **`docs/api/mobile_v1.md` in the Laravel repo** documents every `/api/v1` endpoint the app consumes: method, path, auth, request fields, response shape, error cases. It is written or updated *in the same session* the endpoint is built or first consumed.
- **Additive-only** once an app binary ships reading a field (rule from `mobile_app.md`). Until TestFlight, the contract can still be reshaped freely — use that window to clean up payloads for mobile.
- Most v1 endpoints are the existing web endpoints re-exposed under `/api/v1` with `auth:sanctum`; controllers and Services are reused. The mapping the core loop needs:

| App concern | Existing web endpoint(s) |
|---|---|
| User + plan capabilities | `GET /api/user` |
| Today's session + state flags | `GET /api/dashboard/today` |
| Session actions | `POST .../toggle-piece`, `.../finish`, `.../cancel`, `PATCH .../notes`, ad-hoc pieces, regenerate |
| Repertoire | `GET/POST /api/pieces`, `PUT/DELETE /api/pieces/{id}`, `restore`, `picker`, `stats` |
| History / streak | `GET /api/dashboard/history` |
| New for mobile | `POST /api/v1/login` (token), `POST /api/v1/logout`, `GET /api/v1/app-config`, later `POST /api/v1/devices` |

## 4. Build order

Vertical slices, not layers: each slice goes contract → types → screen → on-device check, and lands fully native-feeling before the next starts. No screen ships "web-flavored now, polish later."

**Phase 0 — backend groundwork** (in the Laravel repo; app not required)
Sanctum, `/api/v1` route group, token login/logout, `app-config`, mobile throttles, `mobile_v1.md` started. Exit: token flow exercised by the test suite.

**Phase 1 — foundation**
Theme tokens; tab shell (native bottom tabs + native-stack per tab); auth screens; token storage in Keychain; client + TanStack Query setup; `app-config` check on launch (force-upgrade gate, trivial now, painful to retrofit). Working tab names to start: **Today, Repertoire, Tools, Settings** — revisit freely before beta. Exit: sign in on a real iPhone, land on an empty Today tab showing your name from `GET /api/v1/user`, kill the app, reopen, still signed in.

**Phase 2 — the core loop** (the milestone that proves the whole idea)
Slice order, each shippable:
1. **Today (read-only):** all five dashboard states rendered natively; skeletons, not spinners.
2. **Session runner:** checklist with optimistic ticks, timer, finish/cancel, session notes. Haptic on tick and on finish from day one — it's core to the interaction, not polish.
3. **Repertoire list + piece detail:** FlashList, swipe actions, context menus on long-press.
4. **Add/edit piece:** native forms, keyboard avoidance; plan-limit states driven by `plan.can_add_piece` (backend decides, app reads — never re-derive limits).
5. **Streak + history.**
Exit: a full real practice session run from the phone, and it feels like an iOS app in the thumb test.

**Phase 3 — SSO + account**
Sign in with Apple (new `apple_id` backend work per `mobile_app.md`, including extending the SSO email-change guard), native Google sign-in, account deletion reachable in-app (App Review requirement), minimal settings (schedule prefs, timezone, sign out everywhere).

**Phase 4 — polish pass**
Empty/error/offline states everywhere (early builds are online-only; failures degrade gracefully, no offline sync yet); Dynamic Type + safe-area audit; dark mode audit; animation/transition review against the native-feel checklist.

**Phase 5 — push + tools**
`devices` endpoint + Expo push for practice reminders (piggyback existing reminder prefs); metronome + drone with native audio (validate timing early — it's the riskiest tech in v1).

**Phase 6 — beta → store**
First EAS build, TestFlight, then the submission checklist in `mobile_app.md` (demo account, privacy labels, screenshots, `/mobile` page + email list announcement).

### Expansion tracks (post-core; order and inclusion decided later)

None of these are excluded — they're sequenced after the core because each is a sizeable project of its own. Pick per-track when the core is real:

- **Theory/Learn** — feasible without a from-scratch rebuild: question pools and theory data are plain JS (Tier 1), notation is pre-rendered SVGs, stave math is `lib/staveRender.js`, soundfont samples are server-hosted. The Vue UI layer (~75 components) is the rebuild. If undertaken, go per-skill in vertical slices, starting with one drill format end-to-end (stave rendering + piano audio) as the technical proof.
- **Insights** — charts + calendar; needs a native charting approach.
- **Audio recordings** — native mic is a strength; R2 presigned-URL pattern already exists.
- **Sheet music viewing** — presigned R2 URLs into a native PDF view.
- **Tuner, richer push, additional tools.**

### Billing — open decision

Whether Pro is sold in-app (Apple IAP via RevenueCat) or stays web-only is **undecided**. Until it's decided, builds ship with *no purchase flow and no links to web pricing* — the App Review-safe posture that keeps both options open. Note the asymmetry: staying web-only costs nothing now; choosing IAP later adds StoreKit, receipt reconciliation against the Stripe-backed plan state, and a second "source of Pro" in `PlanService` (details in `mobile_app.md`). Pro users signing in get Pro features either way via the `capabilities()` payload.

### Definition of done, per screen

- [ ] Navigation is native-stack (swipe-back works; large title behaves on scroll)
- [ ] iOS controls only: action sheets, context menus, native switches/pickers, `Alert` confirms
- [ ] SF Symbols via expo-symbols; no web icon sets
- [ ] Loading = skeleton or optimistic update; no full-screen spinners
- [ ] Light + dark verified; colors only via theme tokens
- [ ] Dynamic Type doesn't break layout; safe areas respected; keyboard doesn't cover inputs
- [ ] Empty, error, and no-connection states designed, not defaulted
- [ ] States/rules cross-checked against the Vue counterpart (Tier 2), layout designed fresh (Tier 3)

## 5. Working practices

- **Claude Code sessions:** work from this repo with the backend added via `/add-dir d:\GitHub\PieceKeeper`. Decisions that touch the API get written to the Laravel repo's `mobile_v1.md` in the same session.
- **Backend changes** follow the backend repo's conventions (CLAUDE.md there): logic in Services, routes in `routes/web.php`, tests alongside the change.
- **Testing:** backend mobile endpoints are covered by the Laravel test suite (phase 0 onward). App side: framework-free logic in `src/lib` gets unit tests; screens are verified on-device (Expo Go now, dev builds later). No E2E harness for v1.
- **Dependencies:** prefer SDK-bundled modules via `npx expo install`; vet any third-party addition (maintenance, download volume, and no just-published versions) before adopting.
- **Git:** small commits per slice step; the repo is independent of the backend repo's history.
