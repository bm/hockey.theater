import { NextResponse } from "next/server";
import { fetchGamesForDate, isSettled } from "@/lib/nhl-api/schedule";
import { gamesCacheControl } from "@/lib/cache";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ date: string }> }
) {
  const { date } = await params;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
  }

  try {
    const games = await fetchGamesForDate(date);
    return NextResponse.json(games, {
      headers: { "Cache-Control": gamesCacheControl(games.every(isSettled)) },
    });
  } catch (err) {
    console.error("Schedule fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch schedule" }, { status: 502 });
  }
}
