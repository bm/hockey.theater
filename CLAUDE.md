@AGENTS.md

# hockey.theater

Fan-made NHL highlights browsing site. Analog of baseball.theater (jakelauer). Free, no auth, no database.

## Dev setup

```bash
pnpm install
pnpm dev      # http://localhost:3000
pnpm build    # production build check
pnpm tsc --noEmit  # type check only
```

No environment variables required. All data comes from the public NHL API — no keys needed.

## Stack

- **Next.js 16** App Router, TypeScript 5 strict
- **Tailwind CSS v4** + shadcn/ui components
- **TanStack Query v5** — client data fetching and live score polling
- **Zustand v5** with `persist` middleware — hide-scores mode, favorite team
- **next-themes** — dark mode default
- **pnpm** package manager

## Data source

NHL public API: `https://api-web.nhle.com/v1/`

Key endpoints used:
- `GET /schedule/{date}` — full week of games; find target date in `gameWeek[]`
- `GET /score/{date}` — live scores for a date; find in `gamesByDate[]`
- `GET /gamecenter/{gameId}/landing` — game detail, goals, video milestone IDs
- `GET /gamecenter/{gameId}/right-rail` — gameVideo IDs (recap/condensed); use this for completed games — landing drops gameVideo after a game ends
- `GET /gamecenter/{gameId}/play-by-play` — full PBP events
- `GET /gamecenter/{gameId}/boxscore` — skater stats

All NHL API calls are proxied through Next.js Route Handlers. The browser never calls the NHL API directly.

## Architecture in brief

```
Browser (React client components + TanStack Query + Zustand)
  ↕ /api/* Route Handlers (proxy + normalize + cache headers)
Next.js server (RSC pages call lib/nhl-api/* directly, no HTTP round-trip)
  ↕
NHL API (api-web.nhle.com/v1)
```

See `ARCHITECTURE.md` for the full picture including request lifecycle, caching strategy, server/client component split, and gotchas.

## Key files

| File | Purpose |
|---|---|
| `types/nhl.ts` | Raw NHL API response types |
| `types/game.ts` | Normalized internal types used by components |
| `lib/nhl-api/client.ts` | Base `nhlFetch()` wrapper |
| `lib/nhl-api/schedule.ts` | `fetchSchedule()`, `fetchScore()`, `normalizeGame()` |
| `lib/nhl-api/game.ts` | `fetchGameLanding()`, `normalizeGameDetail()` |
| `lib/nhl-api/video.ts` | `resolveShareableUrl()` — Brightcove shareable link helper |
| `components/game/HlsPlayer.tsx` | hls.js `<video>` player; accepts `milestoneId` + optional `autoPlay` prop |
| `lib/team-colors.ts` | Static record of all 32 teams (colors, logos, metadata) |
| `lib/cache.ts` | Cache TTL constants and `getScheduleRevalidate()` |
| `store/index.ts` | Zustand store: `hideScores`, `favoriteTeam`, `hasChosenTeam` |
| `proxy.ts` | Next.js 16 edge proxy: `/games` redirect, team abbrev normalization |

## Routes

| Route | Type | Notes |
|---|---|---|
| `/` | Static | Redirects to `/games/{today}` |
| `/games` | Proxy redirect | → `/games/{today}` |
| `/games/[date]` | ISR (60s) | Schedule page |
| `/game/[gameId]` | Dynamic | Game detail |
| `/api/schedule/[date]` | Route Handler | Proxies NHL schedule, returns `NormalizedGame[]` |
| `/api/score/[date]` | Route Handler | Live scores, 30s TTL |
| `/api/game/[gameId]/landing` | Route Handler | Game detail + video |
| `/api/game/[gameId]/pbp` | Route Handler | Play-by-play |
| `/api/game/[gameId]/boxscore` | Route Handler | Skater stats |

## NHL API gotchas

**Future games are missing fields.** `/gamecenter/{id}/landing` does not return `summary`, `periodDescriptor`, or `gameVideo` before a game starts. All access uses optional chaining (`raw.summary?.scoring ?? []`). Types in `types/nhl.ts` mark these as optional.

**Game state needs two fields.** Check `gameScheduleState` first (`PPD`/`CNCL`/`SUSP`), then `gameState` (`FUT`/`PRE`/`LIVE`/`CRIT`/`FINAL`/`OFF`). A postponed game has `gameState: "FUT"` and `gameScheduleState: "PPD"`. See `mapGameState()` in `lib/nhl-api/schedule.ts`.

**`CRIT` is a live state.** When a game is in a critical situation, `gameState` is `"CRIT"` not `"LIVE"`. Both must be treated as live for polling.

**Video clips are Brightcove IDs, not URLs.** `threeMinRecap`, `condensedGame`, and `highlightClip` fields are integers. `/api/video/[milestoneId]` proxies the Brightcove Playback API and returns a raw `.m3u8` URL; `HlsPlayer` plays it via hls.js. Policy key is hardcoded in the route handler (extracted from `players.brightcove.net/6415718365001/default_default/config.json` → `video_cloud.policy_key`). Brightcove search is blocked by this key — only direct video lookup by ID works.

**`gameVideo` missing from `landing` for completed games.** The landing endpoint silently drops `gameVideo` after a game ends. `/gamecenter/{id}/right-rail` always has it. `fetchGameRightRail()` in `lib/nhl-api/game.ts` fetches it; `page.tsx` merges it in when landing has no video.

**Next.js 16 proxy convention.** The file is `proxy.ts` with `export function proxy(...)` — not `middleware.ts`/`middleware`. Using the old name builds but logs a deprecation warning.

## Client state (Zustand)

Persisted to `localStorage` under key `hockey-theater-prefs`:
- `hideScores: boolean` — replaces scores with `?` app-wide; toggled by eye icon in Navbar
- `favoriteTeam: string | null` — team abbrev; gates sort order in ScheduleGrid and pill order in TeamFilterBar
- `hasChosenTeam: boolean` — controls whether the onboarding modal shows

`FavoriteTeamModal` uses a `mounted` guard (`useEffect` + local state) to avoid SSR/hydration mismatch.

## Live polling

`ScheduleGrid` checks if any game has `gameState === "live" | "critical"`. If so, `useLiveScores()` polls `/api/score/[date]` every 30 seconds via TanStack Query `refetchInterval`. Results are merged over the schedule data by game ID. Polling is fully disabled for past dates.

## What's not built yet (V2)

- Team hub pages (`/team/[abbrev]`) — route handler and types exist, no UI
- Play-by-play UI — `/api/game/[gameId]/pbp` route exists, no component
- Boxscore table — `/api/game/[gameId]/boxscore` route exists, no component
- Search — team search is instant (client-side `lib/team-colors.ts`), player search via `search.d3.nhle.com`
- Individual goal clip player — ships hls.js + native `<video>` via `HlsPlayer`. Goal clips autoplay (muted); recap/condensed game does not.
- PWA manifest, standings, playoffs bracket
