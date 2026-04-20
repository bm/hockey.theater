import { nhlFetch } from "./client";
import type { NHLGameLanding, NHLPlayByPlay, NHLBoxscore } from "@/types/nhl";
import type { GameDetail, GoalClip, VideoClip } from "@/types/game";
import { getTeamColors } from "@/lib/team-colors";
import { resolveVideoUrl } from "./video";
import { CACHE_TTL } from "@/lib/cache";

export async function fetchGameLanding(gameId: string): Promise<NHLGameLanding> {
  return nhlFetch<NHLGameLanding>(`/gamecenter/${gameId}/landing`, {
    next: { revalidate: CACHE_TTL.GAME_LANDING_FINAL },
  });
}

export async function fetchPlayByPlay(gameId: string): Promise<NHLPlayByPlay> {
  return nhlFetch<NHLPlayByPlay>(`/gamecenter/${gameId}/play-by-play`, {
    next: { revalidate: CACHE_TTL.PLAY_BY_PLAY_FINAL },
  });
}

export async function fetchBoxscore(gameId: string): Promise<NHLBoxscore> {
  return nhlFetch<NHLBoxscore>(`/gamecenter/${gameId}/boxscore`, {
    next: { revalidate: CACHE_TTL.GAME_LANDING_FINAL },
  });
}

export function normalizeGameDetail(raw: NHLGameLanding): GameDetail {
  const awayColors = getTeamColors(raw.awayTeam.abbrev);
  const homeColors = getTeamColors(raw.homeTeam.abbrev);

  const isLive = raw.gameState === "LIVE" || raw.gameState === "CRIT";

  const scoringPeriods = raw.summary?.scoring ?? [];
  const awayGoalsByPeriod = scoringPeriods.map((p) =>
    p.goals.filter((g) => g.teamAbbrev.default === raw.awayTeam.abbrev).length
  );
  const homeGoalsByPeriod = scoringPeriods.map((p) =>
    p.goals.filter((g) => g.teamAbbrev.default === raw.homeTeam.abbrev).length
  );

  const goals: GoalClip[] = scoringPeriods.flatMap((period) =>
    period.goals.map((goal) => ({
      eventId: `${period.periodDescriptor.number}-${goal.timeInPeriod}-${goal.playerId}`,
      scorer: goal.name.default,
      scorerPlayerId: goal.playerId,
      scorerHeadshot: goal.headshot,
      assists: goal.assists.map((a) => a.name.default),
      teamAbbrev: goal.teamAbbrev.default,
      timeInPeriod: goal.timeInPeriod,
      period: period.periodDescriptor.number,
      periodType: period.periodDescriptor.periodType,
      awayScore: goal.awayScore,
      homeScore: goal.homeScore,
      strength: goal.strength,
      milestoneId: goal.highlightClip,
      embedUrl: goal.highlightClip ? resolveVideoUrl(goal.highlightClip) : undefined,
    }))
  );

  let threeMinRecap: VideoClip | undefined;
  let condensedGame: VideoClip | undefined;

  if (raw.gameVideo?.threeMinRecap) {
    threeMinRecap = {
      milestoneId: raw.gameVideo.threeMinRecap,
      title: "3-Minute Recap",
      embedUrl: resolveVideoUrl(raw.gameVideo.threeMinRecap),
    };
  }

  if (raw.gameVideo?.condensedGame) {
    condensedGame = {
      milestoneId: raw.gameVideo.condensedGame,
      title: "Condensed Game",
      embedUrl: resolveVideoUrl(raw.gameVideo.condensedGame),
    };
  }

  const gameState = isLive ? "live" : raw.gameState === "FINAL" || raw.gameState === "OFF" ? "final" : "scheduled";

  return {
    id: raw.id,
    date: raw.gameDate,
    startTimeUTC: raw.startTimeUTC,
    gameState: gameState as GameDetail["gameState"],
    gameType: raw.gameType === 3 ? "playoffs" : raw.gameType === 1 ? "preseason" : "regular",
    venue: raw.venue.default,
    awayTeam: {
      id: raw.awayTeam.id,
      name: `${raw.awayTeam.placeName.default} ${raw.awayTeam.commonName.default}`,
      shortName: raw.awayTeam.commonName.default,
      abbrev: raw.awayTeam.abbrev,
      logo: raw.awayTeam.logo,
      darkLogo: raw.awayTeam.darkLogo,
      score: raw.awayTeam.score,
      record: raw.awayTeam.record,
      sog: raw.awayTeam.sog,
      hits: raw.awayTeam.hits,
      pim: raw.awayTeam.pim,
      blocks: raw.awayTeam.blocks,
      goalsByPeriod: awayGoalsByPeriod.length > 0 ? awayGoalsByPeriod : undefined,
      ...awayColors,
    },
    homeTeam: {
      id: raw.homeTeam.id,
      name: `${raw.homeTeam.placeName.default} ${raw.homeTeam.commonName.default}`,
      shortName: raw.homeTeam.commonName.default,
      abbrev: raw.homeTeam.abbrev,
      logo: raw.homeTeam.logo,
      darkLogo: raw.homeTeam.darkLogo,
      score: raw.homeTeam.score,
      record: raw.homeTeam.record,
      sog: raw.homeTeam.sog,
      hits: raw.homeTeam.hits,
      pim: raw.homeTeam.pim,
      blocks: raw.homeTeam.blocks,
      goalsByPeriod: homeGoalsByPeriod.length > 0 ? homeGoalsByPeriod : undefined,
      ...homeColors,
    },
    period: raw.periodDescriptor?.number || undefined,
    periodType: raw.periodDescriptor?.periodType || undefined,
    threeMinRecap,
    condensedGame,
    goals,
    shootout: (raw.summary?.shootout ?? []).map((s) => ({
      sequence: s.sequence,
      playerId: s.playerId,
      teamAbbrev: s.teamAbbrev,
      firstName: s.firstName.default,
      lastName: s.lastName.default,
      result: s.result,
      headshot: s.headshot,
      gameWinner: s.gameWinner,
    })),
    threeStars: raw.summary?.threeStars?.map((s) => ({
      star: s.star,
      playerId: s.playerId,
      teamAbbrev: s.teamAbbrev,
      headshot: s.headshot,
      name: s.name.default,
      sweaterNo: s.sweaterNo,
      position: s.position,
      goals: s.goals,
      assists: s.assists,
      points: s.points,
    })) ?? [],
    teamStats: raw.summary?.teamGameStats ?? [],
  };
}
