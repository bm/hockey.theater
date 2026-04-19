import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function todayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /games → /games/today
  if (pathname === "/games") {
    return NextResponse.redirect(new URL(`/games/${todayDate()}`, request.url));
  }

  // /team/bos → /team/BOS (uppercase normalization)
  const teamMatch = pathname.match(/^\/team\/([a-z]{2,4})$/i);
  if (teamMatch) {
    const abbrev = teamMatch[1].toUpperCase();
    if (abbrev !== teamMatch[1]) {
      return NextResponse.redirect(new URL(`/team/${abbrev}`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/games", "/team/:path*"],
};
