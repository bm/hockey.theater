// Video URL resolution for NHL milestone IDs
// The NHL uses Brightcove for video hosting.
// milestoneId maps to a Brightcove video ID.

const BRIGHTCOVE_ACCOUNT = "6415718365001";
const BRIGHTCOVE_PLAYER = "default_default";

/**
 * Returns a Brightcove embed URL for a given milestone ID.
 * This renders an iframe player that handles HLS internally.
 */
export function resolveVideoUrl(milestoneId: number): string {
  return `https://players.brightcove.net/${BRIGHTCOVE_ACCOUNT}/${BRIGHTCOVE_PLAYER}/index.html?videoId=${milestoneId}`;
}

/**
 * Returns a shareable NHL.com highlight URL if available.
 * Falls back to Brightcove embed.
 */
export function resolveShareableUrl(
  milestoneId: number,
  sharingUrl?: string
): string {
  return sharingUrl ?? resolveVideoUrl(milestoneId);
}
