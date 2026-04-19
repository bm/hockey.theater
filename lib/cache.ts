// Cache TTL constants (in seconds) for Next.js fetch revalidation

export const CACHE_TTL = {
  PAST_SCHEDULE: 86400, // 24h — scores never change
  TODAY_PRE_GAME: 300, // 5min — games might shift
  TODAY_LIVE: 30, // 30s — active scores
  TODAY_ALL_FINAL: 600, // 10min
  GAME_LANDING_FINAL: 3600, // 1h — highlights populate over ~2h
  GAME_LANDING_LIVE: 20, // 20s — active play
  PLAY_BY_PLAY_FINAL: 21600, // 6h
  PLAY_BY_PLAY_LIVE: 20, // 20s
  TEAMS: 604800, // 7 days
} as const;

export function getScheduleRevalidate(
  date: string,
  hasLiveGames: boolean
): number {
  const today = new Date().toISOString().slice(0, 10);
  if (date < today) return CACHE_TTL.PAST_SCHEDULE;
  if (date > today) return CACHE_TTL.TODAY_PRE_GAME;
  return hasLiveGames ? CACHE_TTL.TODAY_LIVE : CACHE_TTL.TODAY_ALL_FINAL;
}
