# hockey.theater

Browse NHL game highlights, recaps, and goal clips — free, no account required, spoiler-safe.

Inspired by [baseball.theater](https://baseball.theater) by Jake Lauer.

## Features

- **Schedule by date** — browse every NHL game, navigate day by day
- **Live scores** — auto-refreshes every 30 seconds when games are in progress
- **Game recaps** — 3-minute recap and condensed game videos
- **Goal timeline** — every goal with scorer, assists, time, and clip link
- **Hide scores** — spoiler-free mode; reveal individual games when ready
- **Favorite team** — your team's games sort to the top of every schedule page
- **Team filter** — filter any day's schedule to a single team
- **Playoffs** — series status on every card and game page
- **Dark mode** by default (toggleable)
- **No database, no auth, no tracking**

## Running locally

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). No environment variables required — all data comes from the public NHL API.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 (strict) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Data fetching | TanStack Query v5 |
| State | Zustand v5 |
| Package manager | pnpm |
| Deployment | Vercel |

Data comes from the public NHL API at `api-web.nhle.com/v1`. All requests are proxied through Next.js Route Handlers — no NHL API calls happen from the browser.

## Project structure

```
app/
  games/[date]/       Schedule page
  game/[gameId]/      Game detail page
  api/                NHL API proxy route handlers
components/
  layout/             Navbar, DateNav, FavoriteTeamModal
  schedule/           GameCard, ScheduleGrid, TeamFilterBar
  game/               GameHero, RecapSection, GoalTimeline, ThreeStars, TeamStats
lib/
  nhl-api/            API client, schedule/game fetchers, video URL resolution
  team-colors.ts      Static data for all 32 teams (colors, logos, metadata)
  dates.ts            Date formatting utilities
store/
  index.ts            Zustand store: hideScores, favoriteTeam
types/
  nhl.ts              Raw NHL API response types
  game.ts             Normalized internal types
proxy.ts              URL redirects and team abbrev normalization
```

## Caching

NHL API responses are cached at the Next.js Route Handler layer with TTLs tuned to game state:

| Data | TTL |
|---|---|
| Past schedule | 24 hours |
| Today's schedule (pre-game) | 5 minutes |
| Today's schedule (live) | 30 seconds |
| Game landing (final) | 1 hour |
| Game landing (live) | 20 seconds |

## Roadmap

- [ ] Individual goal clips embedded inline
- [ ] Play-by-play feed (filterable by event type)
- [ ] Team hub pages (`/team/BOS`)
- [ ] Search (teams instant, players via NHL search API)
- [ ] Boxscore table
- [ ] PWA / installable
- [ ] Standings page
- [ ] Playoffs bracket view
- [ ] French language support

## Contributing

PRs welcome. The dev setup is just `pnpm install && pnpm dev` — no Docker, no database, no secrets needed.

## Data

All game data and video content is property of the NHL. This project uses the NHL's public API and is not affiliated with or endorsed by the NHL.
