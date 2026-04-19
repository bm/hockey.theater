import { NextResponse } from "next/server";
import { fetchPlayByPlay } from "@/lib/nhl-api/game";
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
    const data = await fetchPlayByPlay(gameId);
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": `public, s-maxage=${CACHE_TTL.PLAY_BY_PLAY_FINAL}, stale-while-revalidate=${CACHE_TTL.PLAY_BY_PLAY_FINAL * 2}`,
      },
    });
  } catch (err) {
    console.error("PBP fetch error:", err);
    return NextResponse.json({ error: "Play-by-play not found" }, { status: 502 });
  }
}
