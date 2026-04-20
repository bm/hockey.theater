import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { fetchGameLanding, normalizeGameDetail } from "@/lib/nhl-api/game";
import { formatShortDate } from "@/lib/dates";
import { GameHero } from "@/components/game/GameHero";
import { RecapSection } from "@/components/game/RecapSection";
import { GoalTimeline } from "@/components/game/GoalTimeline";
import { TeamStats } from "@/components/game/TeamStats";
import { ThreeStars } from "@/components/game/ThreeStars";

interface PageProps {
  params: Promise<{ gameId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { gameId } = await params;
  try {
    const raw = await fetchGameLanding(gameId);
    const game = normalizeGameDetail(raw);
    return {
      title: `${game.awayTeam.abbrev} vs ${game.homeTeam.abbrev} — ${game.date}`,
    };
  } catch {
    return { title: "Game" };
  }
}

export default async function GamePage({ params }: PageProps) {
  const { gameId } = await params;

  if (!/^\d+$/.test(gameId)) notFound();

  let game;
  try {
    const raw = await fetchGameLanding(gameId);
    game = normalizeGameDetail(raw);
  } catch {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 pt-4">
        <Link
          href={`/games/${game.date}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
        >
          <ChevronLeft className="h-4 w-4" />
          Games · {formatShortDate(game.date)}
        </Link>
      </div>

      <GameHero game={game} />

      {/* Recap videos — wider container for cinematic video */}
      {(game.threeMinRecap || game.condensedGame) && (
        <div className="mx-auto max-w-6xl px-4 pt-8">
          <h2 className="font-display font-bold text-2xl uppercase tracking-wide mb-6">Game Video</h2>
          <RecapSection
            threeMinRecap={game.threeMinRecap}
            condensedGame={game.condensedGame}
          />
        </div>
      )}

      <div className="mx-auto max-w-4xl px-4 py-8 flex flex-col gap-12">

        {/* Goal Timeline */}
        <section>
          <h2 className="font-display font-bold text-2xl uppercase tracking-wide mb-6">
            Goals{" "}
            <span className="text-muted-foreground font-semibold text-lg normal-case tracking-normal">
              ({game.goals.length})
            </span>
          </h2>
          <GoalTimeline
            goals={game.goals}
            awayAbbrev={game.awayTeam.abbrev}
            homeAbbrev={game.homeTeam.abbrev}
          />
        </section>

        {/* Three Stars */}
        {game.threeStars.length > 0 && (
          <section>
            <ThreeStars stars={game.threeStars} />
          </section>
        )}

        {/* Team Stats */}
        {game.teamStats.length > 0 && (
          <section>
            <h2 className="font-display font-bold text-2xl uppercase tracking-wide mb-6">Team Stats</h2>
            <TeamStats
              stats={game.teamStats}
              awayTeam={game.awayTeam}
              homeTeam={game.homeTeam}
            />
          </section>
        )}
      </div>
    </div>
  );
}
