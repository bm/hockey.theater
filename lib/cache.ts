// Cache TTL constants (in seconds) for Next.js fetch revalidation

export const CACHE_TTL = {
  PAST_SCHEDULE: 86400, // 24h — scores never change
  TODAY_PRE_GAME: 300, // 5min — games might shift
  TODAY_LIVE: 30, // 30s — active scores
  SCORE: 10, // 10s — /score data cache, authoritative live state
  TODAY_ALL_FINAL: 600, // 10min
  GAME_LANDING_FINAL: 3600, // 1h — highlights populate over ~2h
  GAME_LANDING_LIVE: 20, // 20s — active play
  PLAY_BY_PLAY_FINAL: 21600, // 6h
  PLAY_BY_PLAY_LIVE: 20, // 20s
  TEAMS: 604800, // 7 days
} as const;

/**
 * Cache-Control for a list of games, keyed on the games' own state instead of
 * the server's clock: the server runs in UTC, so evening ET games belong to a
 * date the server already considers "past".
 */
export function gamesCacheControl(allSettled: boolean): string {
  return allSettled
    ? "public, s-maxage=3600, stale-while-revalidate=86400"
    : "public, s-maxage=10, stale-while-revalidate=10";
}
