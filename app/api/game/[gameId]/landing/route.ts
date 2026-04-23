import { NextResponse } from "next/server";
import { fetchGameLanding, fetchGameRightRail, normalizeGameDetail } from "@/lib/nhl-api/game";
import { CACHE_TTL } from "@/lib/cache";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ gameId: string }> }
) {
  const { gameId } = await params;

  if (!/^\d+$/.test(gameId)) {
    return NextResponse.json({ error: "Invalid game ID" }, { status: 400 });
  }

  try {
    const [raw, rightRail] = await Promise.all([
      fetchGameLanding(gameId),
      fetchGameRightRail(gameId).catch(() => null),
    ]);
    if (!raw.gameVideo && rightRail?.gameVideo) {
      raw.gameVideo = rightRail.gameVideo;
    }
    const normalized = normalizeGameDetail(raw);

    const isLive = normalized.gameState === "live";
    const ttl = isLive ? CACHE_TTL.GAME_LANDING_LIVE : CACHE_TTL.GAME_LANDING_FINAL;

    return NextResponse.json(normalized, {
      headers: {
        "Cache-Control": `public, s-maxage=${ttl}, stale-while-revalidate=${ttl * 2}`,
      },
    });
  } catch (err) {
    console.error("Game landing fetch error:", err);
    return NextResponse.json({ error: "Game not found" }, { status: 502 });
  }
}
