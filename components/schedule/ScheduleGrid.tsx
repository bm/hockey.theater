"use client";

import { useMemo, useEffect } from "react";
import { useSchedule, useLiveScores } from "@/hooks/useSchedule";
import { useFavoriteTeam } from "@/store";
import { GameCard, GameCardSkeleton } from "./GameCard";
import type { NormalizedGame } from "@/types/game";

interface ScheduleGridProps {
  date: string;
  teamFilter: string | null;
  initialGames?: NormalizedGame[];
}

export function ScheduleGrid({ date, teamFilter, initialGames }: ScheduleGridProps) {
  const favoriteTeam = useFavoriteTeam();

  const { data: scheduleGames, isLoading } = useSchedule(date);
  const games = scheduleGames ?? initialGames ?? [];

  const hasLive = games.some(
    (g) => g.gameState === "live" || g.gameState === "critical"
  );

  const { data: liveGames } = useLiveScores(date, hasLive);

  // Merge live scores over schedule data
  const mergedGames = useMemo(() => {
    if (!liveGames || liveGames.length === 0) return games;
    const liveMap = new Map(liveGames.map((g) => [g.id, g]));
    return games.map((g) => liveMap.get(g.id) ?? g);
  }, [games, liveGames]);

  // Sort: favorite team first, then by start time
  const sortedGames = useMemo(() => {
    return [...mergedGames].sort((a, b) => {
      const aIsFav =
        a.awayTeam.abbrev === favoriteTeam ||
        a.homeTeam.abbrev === favoriteTeam;
      const bIsFav =
        b.awayTeam.abbrev === favoriteTeam ||
        b.homeTeam.abbrev === favoriteTeam;
      if (aIsFav && !bIsFav) return -1;
      if (!aIsFav && bIsFav) return 1;
      return a.startTimeUTC.localeCompare(b.startTimeUTC);
    });
  }, [mergedGames, favoriteTeam]);

  const filteredGames = useMemo(() => {
    if (!teamFilter) return sortedGames;
    return sortedGames.filter(
      (g) =>
        g.awayTeam.abbrev === teamFilter || g.homeTeam.abbrev === teamFilter
    );
  }, [sortedGames, teamFilter]);

  if (isLoading && !initialGames) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <GameCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (filteredGames.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-4xl mb-4">🏒</p>
        <p className="text-muted-foreground">
          {teamFilter
            ? `No games for ${teamFilter} on this date`
            : "No games scheduled for this date"}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {filteredGames.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  );
}
