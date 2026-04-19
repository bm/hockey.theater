import { NextResponse } from "next/server";
import { fetchScore } from "@/lib/nhl-api/schedule";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ date: string }> }
) {
  const { date } = await params;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
  }

  try {
    const games = await fetchScore(date);
    return NextResponse.json(games, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    });
  } catch (err) {
    console.error("Score fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch scores" }, { status: 502 });
  }
}
