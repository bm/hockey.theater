# Architecture

hockey.theater is a Next.js 16 App Router application. There is no database and no authentication. The entire data layer is the public NHL API at `api-web.nhle.com/v1`, proxied server-side. Every piece of infrastructure that matters lives in this repo.

---

## Layer overview

```
Browser
  └── React client components
        ├── TanStack Query (fetch + cache + polling)
        └── Zustand (hideScores, favoriteTeam)

Next.js server
  ├── Page components (RSC)          — initial HTML, SEO, server-side prefetch
  ├── Route Handlers (/api/*)        — NHL API proxy with cache headers
  └── proxy.ts                       — URL redirects (edge runtime)

External
  └── NHL API (api-web.nhle.com/v1)  — schedule, scores, game detail, PBP
      └── Brightcove CDN             — video embeds (milestone IDs → iframe URLs)
```

---

## Request lifecycle

### Schedule page (`/games/2026-04-19`)

```
1. Browser hits /games/2026-04-19
2. Next.js renders SchedulePage (RSC)
   └── calls fetchGamesForDate("2026-04-19") directly — no HTTP, same process
       ├── nhlFetch("/schedule/2026-04-19") → structure (teams, broadcasts, series)
       └── nhlFetch("/score/2026-04-19")    → authoritative state + scores, merged by ID
3. HTML is streamed to browser with initial game data
4. React hydrates; ScheduleGrid mounts as a client component
   └── useSchedule(date, initialGames) seeds TanStack Query with the SSR data,
       refetches /api/schedule/{date} on mount unless every game is settled,
       then polls on an interval chosen from the games' state
```

The `/schedule` endpoint lags badly on live state, so it is only used for structure. `/score` is merged over it on the server, and the browser only ever sees merged data.

### Game detail page (`/game/2025030151`)

```
1. fetchGameLanding(gameId) runs server-side
2. normalizeGameDetail() transforms raw NHL shape into GameDetail
3. All sections (GameHero, GoalTimeline, RecapSection, etc.) render as RSCs
4. No client-side refetching unless the game is live
   (useGameDetail hook exists for future live game detail refresh)
```

---

## Data flow and normalization

The NHL API returns a raw shape that the app never exposes directly to components. Two transformation layers sit between the API and the UI.

### Types

```
types/nhl.ts          Raw NHL API response types (NHLScheduleGame, NHLGameLanding, etc.)
types/game.ts         Normalized internal types (NormalizedGame, GameDetail, GoalClip, etc.)
```

The raw types mirror the actual API JSON field names (e.g. `commonName`, `placeName`, `gameScheduleState`). The normalized types use clean, consistent names that components can depend on without knowing anything about NHL API quirks.

### Normalization functions

`lib/nhl-api/schedule.ts`
- `normalizeGame(raw: NHLScheduleGame, date): NormalizedGame` — maps the schedule game shape
- `fetchGamesForDate(date)` — schedule structure + `/score` state merged; used by the page and `/api/schedule`
- `buildSeriesStatusText(...)` — converts numeric series win counts into readable strings ("BOS leads 3-1")
- `mapGameState()` — translates NHL's `FUT`/`PRE`/`LIVE`/`CRIT`/`FINAL`/`OFF` + `gameScheduleState` into the app's `GameState` union

`lib/nhl-api/game.ts`
- `normalizeGameDetail(raw: NHLGameLanding): GameDetail` — maps the landing endpoint
- Handles missing fields gracefully with optional chaining (`raw.summary?.scoring ?? []`) because future/pre-game landings don't return `summary` or `periodDescriptor`

### Team colors

`lib/team-colors.ts` is a static record of all 32 NHL teams keyed by abbreviation. It includes hex colors, full name, city, conference, division, and logo CDN URLs. This data never changes mid-season, so it lives at build time rather than being fetched. Colors are merged into every `NormalizedTeamScore` at normalization time, so components never look them up separately.

---

## API proxy layer

All NHL API calls happen server-side. The browser never calls `api-web.nhle.com` directly.

### Why proxy

- **CORS**: the NHL API doesn't allow browser-origin requests in all cases
- **Caching**: `Cache-Control` headers on Route Handler responses are picked up by Vercel's Edge Cache, turning repeated requests into cache hits
- **Normalization**: the route handler runs the normalization function, so the client receives clean `NormalizedGame` objects, not raw NHL JSON
- **Input validation**: route handlers validate path params (`/^\d{4}-\d{2}-\d{2}$/.test(date)`) before touching the external API

### Cache TTL strategy

`lib/cache.ts` defines the TTLs. Route handlers apply them as `Cache-Control: public, s-maxage=N, stale-while-revalidate=2N` headers.

| Endpoint | TTL | Reasoning |
|---|---|---|
| `/schedule` data cache | 5min | Structure only; state comes from `/score` |
| `/score` data cache | 10s | Authoritative live state |
| `/api/schedule` (any game unsettled) | 10s | Live or upcoming games |
| `/api/schedule` (all settled) | 1h | Final / postponed / cancelled won't change |
| Game landing (final) | 1h | Video highlights appear ~2h post-game |
| Game landing (live) | 20s | Active play-by-play |
| Play-by-play (final) | 6h | Immutable once final |

`gamesCacheControl(allSettled)` picks the header from the games' own state, never from the server clock. The server runs in UTC, so from 7pm ET onward the night's date is already "yesterday" there; keying cache TTLs on the date is what previously froze live games in a 24h CDN cache.

---

## Client state

Two pieces of state live in the browser across sessions, managed by a single Zustand store with `persist` middleware writing to `localStorage` under the key `hockey-theater-prefs`.

```typescript
// store/index.ts
interface AppState {
  hideScores: boolean       // toggles spoiler-free mode app-wide
  favoriteTeam: string|null // team abbrev, e.g. "BOS"
  hasChosenTeam: boolean    // tracks whether the onboarding modal was dismissed
}
```

**hideScores** is read by `GameCard` (replaces scores with `?`) and `GameHero` (blurs the score section). It's toggled by the eye button in `Navbar`. The state is global and instant — no prop drilling.

**favoriteTeam** drives two behaviors:
1. `ScheduleGrid` sorts games so the favorite team's games appear first
2. `TeamFilterBar` puts the favorite team's pill first and adds a star icon

**hasChosenTeam** gates the `FavoriteTeamModal`. Once the user picks a team or clicks Skip, it's set to `true` and the modal never shows again.

TanStack Query is used only for remote data. It is not used for UI state.

---

## Server vs. client components

Next.js App Router defaults to server components. Components opt in to the client with `"use client"` at the top of the file.

**Server components** (no directive):
- All `app/*/page.tsx` files — run once per request, generate HTML, access the NHL API directly
- `GameHero`, `GoalTimeline`, `ThreeStars`, `TeamStats`, `DateNav` — pure display, no interactivity or browser APIs needed

**Client components** (`"use client"`):
- `ScheduleGrid` — needs TanStack Query for polling and Zustand for favorite team sort
- `GameCard` — has local `revealed` state for hide-scores click-to-reveal
- `TeamFilterBar` — uses `useRouter`/`useSearchParams` for URL mutation
- `Navbar` — reads/writes Zustand store
- `FavoriteTeamModal` — needs `useEffect` for mount guard (SSR hydration safety)
- `QueryProvider` — must be a client component to instantiate `QueryClient`
- All hooks (`useSchedule`, `useGameDetail`) — TanStack Query requires client context

The split is intentional: server components handle initial data and markup; client components handle interactivity and live updates. Server components can import and call `lib/nhl-api/*` functions directly without going through `/api/*` routes — the route handlers exist for the browser-side fetches only.

---

## Live score updates

`useSchedule(date, initialGames)` is the only client query on the schedule page. Its `refetchInterval` is computed from the current data:

| Games | Interval |
|---|---|
| Any live/critical, or a scheduled game starting within 15 min (or overdue) | 30s |
| Unsettled games, none imminent | 5 min |
| All final/postponed/cancelled | off |

This works for any date and any viewer timezone, so a late game from "yesterday" keeps updating until it ends. `/api/schedule/[date]` returns schedule structure with `/score` state merged in (`fetchGamesForDate()`).

**`/score` response shape:** games are a flat top-level `games[]` (each with `gameDate`), and team objects are slimmer than schedule teams (`name` instead of `placeName`/`commonName`, no `darkLogo`/`record`). Never run score games through `normalizeGame()`; `applyScore()` copies only state, scores, and period onto schedule games.

---

## Video resolution

The NHL API returns `milestoneId` integers for video clips — not URLs. These are Brightcove video IDs.

```
NHLGameVideo.threeMinRecap   → number (milestoneId)
NHLGameVideo.condensedGame   → number (milestoneId)
NHLGoal.highlightClip        → number (milestoneId)
```

All video playback goes through the same pipeline:

```
milestoneId
  → /api/video/[milestoneId]   (Route Handler, cached 24h)
      → Brightcove Playback API (edge.api.brightcove.com)
          → returns .m3u8 HLS URL
              → HlsPlayer (hls.js or native HLS on Safari)
```

`HlsPlayer` is a client component that fetches the HLS URL from `/api/video/[milestoneId]` and plays it via hls.js (or native HLS on Safari). It is used for both recap/condensed game videos (`RecapSection`) and individual goal clips (`GoalWatchButton`).

Goal clips open in a modal with prev/next navigation across all goals in the game (in chronological order). The modal is keyboard-navigable: ←/→ to step through clips, Escape to close.

---

## Routing

```
/                         → proxy redirect → /games/{today}
/games                    → proxy redirect → /games/{today}
/games/[date]             → SchedulePage (ISR, revalidate: 60s)
/game/[gameId]            → GamePage (dynamic, no ISR)
/team/[abbrev]            → (not yet built)
/api/schedule/[date]      → Route Handler
/api/game/[gameId]/landing   → Route Handler
/api/game/[gameId]/pbp       → Route Handler
/api/game/[gameId]/boxscore  → Route Handler
/api/video/[milestoneId]     → Route Handler (Brightcove → HLS URL, cached 24h)
```

`proxy.ts` (Next.js 16's replacement for `middleware.ts`) runs at the edge and handles two redirects: `/games` → today, and `/team/bos` → `/team/BOS` case normalization. It uses the `proxy` export name and `config.matcher` to limit which paths it intercepts.

`SchedulePage` sets `export const revalidate = 60` and `export const dynamicParams = true`. This means Next.js will ISR-regenerate any date page at most once per minute if it's been visited. The last-N-days pages could be pre-generated at build time with `generateStaticParams` as an optimization, but currently all dates are fully dynamic.

---

## Adding a new feature

### New page (e.g. team hub at `/team/[abbrev]`)

1. Create `app/team/[abbrev]/page.tsx` as an RSC
2. Fetch from `lib/nhl-api/` directly in the page (or add a new fetcher in `lib/nhl-api/teams.ts`)
3. If the team page needs live data, add a Route Handler and a TanStack Query hook
4. Add the team abbrev to `proxy.ts` config matcher if URL normalization is needed (already handles `/team/:path*`)

### New NHL API endpoint

1. Add raw response types to `types/nhl.ts`
2. Add a fetcher function in the appropriate `lib/nhl-api/*.ts` file using `nhlFetch()`
3. Add normalization logic and update `types/game.ts` if new internal types are needed
4. Add a Route Handler in `app/api/` with appropriate `Cache-Control` headers
5. Add a TanStack Query hook in `hooks/` if the client needs to fetch it

### New UI state

Add a field to the `AppState` interface in `store/index.ts`, add it to the `partialize` list if it should persist to localStorage, and expose a selector hook at the bottom of the file.

---

## Key constraints and gotchas

**NHL API future games have no `summary` or `periodDescriptor`**. The landing endpoint (`/gamecenter/{id}/landing`) only includes scoring summary, period info, and video data after a game has started. All accesses to these fields in `normalizeGameDetail` use optional chaining.

**NHL API game state uses two fields**. `gameState` (`FUT`/`LIVE`/`FINAL`/etc.) and `gameScheduleState` (`OK`/`PPD`/`SUSP`/`CNCL`) must both be checked. A postponed game has `gameState: "FUT"` and `gameScheduleState: "PPD"`. `mapGameState()` checks `gameScheduleState` first.

**Next.js 16 renamed middleware**. The file is `proxy.ts` and the export is `function proxy(...)`, not `function middleware(...)`. The old filename still works but emits a deprecation warning.

**`suppressHydrationWarning` on `<html>`** is required because `next-themes` sets the `class` attribute server-side based on the default theme (`"dark"`) but React's hydration would otherwise complain about a mismatch.

**Zustand `persist` + SSR**. The store's persisted state is only available after hydration. `FavoriteTeamModal` uses `useEffect` + local `mounted` state to avoid rendering on the server (where `localStorage` doesn't exist and `hasChosenTeam` would always be `false`, causing a hydration flash).

**Broadcasts filter**. `tvBroadcasts` from the NHL API includes national (`N`), home (`H`), and away (`A`) market entries. The schedule page only shows national broadcasts — `game.tvBroadcasts.filter((b) => b.market === "N")` — to keep the cards uncluttered. All broadcasts are available in the raw type if needed.
