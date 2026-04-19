"use client";

import { useQuery } from "@tanstack/react-query";
import type { GameDetail } from "@/types/game";
import type { NHLPlayByPlay } from "@/types/nhl";

async function fetchGameDetail(gameId: string): Promise<GameDetail> {
  const res = await fetch(`/api/game/${gameId}/landing`);
  if (!res.ok) throw new Error("Failed to fetch game");
  return res.json();
}

async function fetchPBP(gameId: string): Promise<NHLPlayByPlay> {
  const res = await fetch(`/api/game/${gameId}/pbp`);
  if (!res.ok) throw new Error("Failed to fetch play-by-play");
  return res.json();
}

export function useGameDetail(gameId: string, isLive: boolean) {
  return useQuery({
    queryKey: ["game", gameId],
    queryFn: () => fetchGameDetail(gameId),
    refetchInterval: isLive ? 20_000 : false,
    staleTime: isLive ? 15_000 : 300_000,
  });
}

export function usePlayByPlay(gameId: string, enabled = true) {
  return useQuery({
    queryKey: ["pbp", gameId],
    queryFn: () => fetchPBP(gameId),
    enabled,
    staleTime: 60_000,
  });
}
