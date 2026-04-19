import { NextResponse } from "next/server";
import { fetchSchedule } from "@/lib/nhl-api/schedule";
import { getScheduleRevalidate } from "@/lib/cache";
import { todayDate } from "@/lib/dates";
import type { NormalizedGame } from "@/types/game";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ date: string }> }
) {
  const { date } = await params;

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
  }

  try {
    const games = await fetchSchedule(date);

    const hasLiveGames = games.some(
      (g: NormalizedGame) => g.gameState === "live" || g.gameState === "critical"
    );
    const revalidate = getScheduleRevalidate(date, hasLiveGames);
    const isToday = date === todayDate();

    return NextResponse.json(games, {
      headers: {
        "Cache-Control": isToday
          ? `public, s-maxage=${revalidate}, stale-while-revalidate=${revalidate * 2}`
          : "public, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch (err) {
    console.error("Schedule fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch schedule" }, { status: 502 });
  }
}
