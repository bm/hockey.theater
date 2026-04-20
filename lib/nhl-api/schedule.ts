import { nhlFetch } from "./client";
import type {
  NHLScheduleResponse,
  NHLScoreResponse,
  NHLScheduleGame,
  NHLGameState,
} from "@/types/nhl";
import type { NormalizedGame } from "@/types/game";
import { getTeamColors } from "@/lib/team-colors";
import { CACHE_TTL } from "@/lib/cache";

function mapGameState(
  state: NHLGameState,
  scheduleState: string
): NormalizedGame["gameState"] {
  if (scheduleState === "PPD") return "postponed";
  if (scheduleState === "CNCL" || scheduleState === "SUSP") return "cancelled";
  switch (state) {
    case "FUT":
    case "PRE":
      return "scheduled";
    case "LIVE":
      return "live";
    case "CRIT":
      return "critical";
    case "FINAL":
    case "OFF":
      return "final";
    default:
      return "scheduled";
  }
}

function mapGameType(gameType: number): NormalizedGame["gameType"] {
  switch (gameType) {
    case 1:
      return "preseason";
    case 3:
      return "playoffs";
    default:
      return "regular";
  }
}

export function normalizeGame(game: NHLScheduleGame): NormalizedGame {
  const awayColors = getTeamColors(game.awayTeam.abbrev);
  const homeColors = getTeamColors(game.homeTeam.abbrev);

  const seriesStatusText = game.seriesStatus
    ? buildSeriesStatusText(game.seriesStatus, game.awayTeam.id, game.homeTeam.id, game.awayTeam.abbrev, game.homeTeam.abbrev)
    : undefined;

  return {
    id: game.id,
    date: game.startTimeUTC.slice(0, 10),
    startTimeUTC: game.startTimeUTC,
    gameState: mapGameState(game.gameState, game.gameScheduleState),
    gameType: mapGameType(game.gameType),
    isPlayoffs: game.gameType === 3,
    venue: game.venue.default,
    awayTeam: {
      id: game.awayTeam.id,
      name: `${game.awayTeam.placeName.default} ${game.awayTeam.commonName.default}`,
      shortName: game.awayTeam.commonName.default,
      abbrev: game.awayTeam.abbrev,
      logo: game.awayTeam.logo,
      darkLogo: game.awayTeam.darkLogo,
      score: game.awayTeam.score,
      record: game.awayTeam.record,
      ...awayColors,
    },
    homeTeam: {
      id: game.homeTeam.id,
      name: `${game.homeTeam.placeName.default} ${game.homeTeam.commonName.default}`,
      shortName: game.homeTeam.commonName.default,
      abbrev: game.homeTeam.abbrev,
      logo: game.homeTeam.logo,
      darkLogo: game.homeTeam.darkLogo,
      score: game.homeTeam.score,
      record: game.homeTeam.record,
      ...homeColors,
    },
    broadcasts: game.tvBroadcasts
      .filter((b) => b.market === "N")
      .map((b) => b.network),
    period: game.periodDescriptor.number || undefined,
    periodType: game.periodDescriptor.periodType || undefined,
    gameOutcome: game.gameOutcome?.lastPeriodType,
    seriesStatus: seriesStatusText,
    gameCenterLink: game.gameCenterLink,
  };
}

function buildSeriesStatusText(
  status: NonNullable<NHLScheduleGame["seriesStatus"]>,
  awayId: number,
  homeId: number,
  awayAbbrev: string,
  homeAbbrev: string
): string {
  const topAbbrev = status.topSeedTeamId === awayId ? awayAbbrev : homeAbbrev;
  const botAbbrev = status.bottomSeedTeamId === awayId ? awayAbbrev : homeAbbrev;
  const topWins = status.topSeedWins;
  const botWins = status.bottomSeedWins;

  if (topWins === botWins) return `Series tied ${topWins}-${botWins}`;
  if (topWins > botWins) {
    return topWins === status.neededToWin
      ? `${topAbbrev} wins series ${topWins}-${botWins}`
      : `${topAbbrev} leads ${topWins}-${botWins}`;
  }
  return botWins === status.neededToWin
    ? `${botAbbrev} wins series ${botWins}-${topWins}`
    : `${botAbbrev} leads ${botWins}-${topWins}`;
}

// Called server-side in Route Handlers
export async function fetchSchedule(date: string): Promise<NormalizedGame[]> {
  const data = await nhlFetch<NHLScheduleResponse>(`/schedule/${date}`, {
    next: { revalidate: CACHE_TTL.TODAY_PRE_GAME },
  });

  const day = data.gameWeek.find((d) => d.date === date);
  return day ? day.games.map(normalizeGame) : [];
}

export async function fetchScore(date: string): Promise<NormalizedGame[]> {
  const data = await nhlFetch<NHLScoreResponse>(`/score/${date}`, {
    next: { revalidate: CACHE_TTL.TODAY_LIVE },
  });

  const day = data.gamesByDate?.find((d) => d.date === date);
  return day ? day.games.map(normalizeGame) : [];
}
