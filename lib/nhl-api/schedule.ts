import { nhlFetch } from "./client";
import type {
  NHLScheduleResponse,
  NHLScoreResponse,
  NHLScoreGame,
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

export function normalizeGame(
  game: NHLScheduleGame,
  gameDate?: string
): NormalizedGame {
  const awayColors = getTeamColors(game.awayTeam.abbrev);
  const homeColors = getTeamColors(game.homeTeam.abbrev);

  const seriesStatusText = game.seriesStatus
    ? buildSeriesStatusText(game.seriesStatus)
    : undefined;

  return {
    id: game.id,
    // Local (ET) game date from the schedule day. startTimeUTC rolls over to the
    // next day for any game starting at or after 7pm ET.
    date: gameDate ?? game.startTimeUTC.slice(0, 10),
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
  status: NonNullable<NHLScheduleGame["seriesStatus"]>
): string {
  const topAbbrev = status.topSeedTeamAbbrev;
  const botAbbrev = status.bottomSeedTeamAbbrev;
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

/** Final, postponed or cancelled: the game's state will not change again. */
export function isSettled(game: NormalizedGame): boolean {
  return (
    game.gameState === "final" ||
    game.gameState === "postponed" ||
    game.gameState === "cancelled"
  );
}

// Schedule supplies the full game structure (team names, broadcasts, series).
// It lags badly on live state, so it is only cached and never trusted for state.
export async function fetchSchedule(date: string): Promise<NormalizedGame[]> {
  const data = await nhlFetch<NHLScheduleResponse>(`/schedule/${date}`, {
    next: { revalidate: CACHE_TTL.TODAY_PRE_GAME },
  });

  const day = data.gameWeek.find((d) => d.date === date);
  return day ? day.games.map((g) => normalizeGame(g, date)) : [];
}

// Score is the authoritative source for live state and scores.
async function fetchScoreGames(date: string): Promise<NHLScoreGame[]> {
  const data = await nhlFetch<NHLScoreResponse>(`/score/${date}`, {
    next: { revalidate: CACHE_TTL.SCORE },
  });
  return (data.games ?? []).filter((g) => g.gameDate === date);
}

function applyScore(game: NormalizedGame, score: NHLScoreGame): NormalizedGame {
  return {
    ...game,
    gameState: mapGameState(score.gameState, score.gameScheduleState),
    startTimeUTC: score.startTimeUTC,
    awayTeam: { ...game.awayTeam, score: score.awayTeam.score },
    homeTeam: { ...game.homeTeam, score: score.homeTeam.score },
    period: score.periodDescriptor?.number || score.period || undefined,
    periodType: score.periodDescriptor?.periodType || undefined,
    gameOutcome: score.gameOutcome?.lastPeriodType,
  };
}

/**
 * Games for a date with correct live state: schedule structure + score state.
 * Score refetches are skipped once every scheduled game is settled.
 */
export async function fetchGamesForDate(date: string): Promise<NormalizedGame[]> {
  const games = await fetchSchedule(date);
  if (games.length === 0 || games.every(isSettled)) return games;

  let scores: NHLScoreGame[];
  try {
    scores = await fetchScoreGames(date);
  } catch (err) {
    console.error("Score fetch failed, falling back to schedule state:", err);
    return games;
  }

  const byId = new Map(scores.map((s) => [s.id, s]));
  return games.map((g) => {
    const score = byId.get(g.id);
    return score ? applyScore(g, score) : g;
  });
}
