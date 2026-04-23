const BRIGHTCOVE_ACCOUNT = "6415718365001";
const BRIGHTCOVE_PLAYER = "default_default";

export function resolveShareableUrl(
  milestoneId: number,
  sharingUrl?: string
): string {
  return (
    sharingUrl ??
    `https://players.brightcove.net/${BRIGHTCOVE_ACCOUNT}/${BRIGHTCOVE_PLAYER}/index.html?videoId=${milestoneId}`
  );
}
