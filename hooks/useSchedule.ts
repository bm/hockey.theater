"use client";

import { useQuery } from "@tanstack/react-query";
import type { NormalizedGame } from "@/types/game";

async function fetchGames(date: string): Promise<NormalizedGame[]> {
  const res = await fetch(`/api/schedule/${date}`);
  if (!res.ok) throw new Error("Failed to fetch schedule");
  return res.json();
}

async function fetchScores(date: string): Promise<NormalizedGame[]> {
  const res = await fetch(`/api/score/${date}`);
  if (!res.ok) throw new Error("Failed to fetch scores");
  return res.json();
}

export function useSchedule(date: string) {
  return useQuery({
    queryKey: ["schedule", date],
    queryFn: () => fetchGames(date),
    staleTime: 60_000,
  });
}

export function useLiveScores(date: string, enabled: boolean) {
  return useQuery({
    queryKey: ["scores", date],
    queryFn: () => fetchScores(date),
    enabled,
    refetchInterval: enabled ? 30_000 : false,
    staleTime: 20_000,
  });
}
