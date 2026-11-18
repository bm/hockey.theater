"use client";

import { useQuery } from "@tanstack/react-query";
import type { NormalizedGame } from "@/types/game";

async function fetchGames(date: string): Promise<NormalizedGame[]> {
  const res = await fetch(`/api/schedule/${date}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch schedule");
  return res.json();
}

const LIVE_POLL_MS = 30_000;
const IDLE_POLL_MS = 5 * 60_000;
const PREGAME_WINDOW_MS = 15 * 60_000;

function isSettled(g: NormalizedGame): boolean {
  return (
    g.gameState === "final" ||
    g.gameState === "postponed" ||
    g.gameState === "cancelled"
  );
}

/**
 * Poll fast while any game is live or about to start, slowly while games are
 * still upcoming, and not at all once every game is settled. Driven by the
 * games' own state, so it works for any date regardless of the viewer's
 * timezone (an evening game in ET is "yesterday" for part of the world).
 */
function pollInterval(games: NormalizedGame[] | undefined): number | false {
  if (!games) return LIVE_POLL_MS;
  const pending = games.filter((g) => !isSettled(g));
  if (pending.length === 0) return false;
  const now = Date.now();
  const active = pending.some(
    (g) =>
      g.gameState === "live" ||
      g.gameState === "critical" ||
      Date.parse(g.startTimeUTC) - now < PREGAME_WINDOW_MS
  );
  return active ? LIVE_POLL_MS : IDLE_POLL_MS;
}

export function useSchedule(date: string, initialGames?: NormalizedGame[]) {
  return useQuery({
    queryKey: ["schedule", date],
    queryFn: () => fetchGames(date),
    initialData: initialGames,
    // ISR HTML can be up to a minute old: refetch on mount unless all settled.
    staleTime: (query) =>
      query.state.data?.every(isSettled) ? Infinity : 0,
    refetchInterval: (query) => pollInterval(query.state.data),
    refetchIntervalInBackground: false,
  });
}
