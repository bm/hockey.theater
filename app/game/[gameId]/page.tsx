import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchGameLanding, normalizeGameDetail } from "@/lib/nhl-api/game";
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
      <GameHero game={game} />

      <div className="mx-auto max-w-4xl px-4 py-8 flex flex-col gap-12">
        {/* Recap videos */}
        {(game.threeMinRecap || game.condensedGame) && (
          <section>
            <h2 className="text-xl font-bold mb-6">Game Video</h2>
            <RecapSection
              threeMinRecap={game.threeMinRecap}
              condensedGame={game.condensedGame}
            />
          </section>
        )}

        {/* Goal Timeline */}
        <section>
          <h2 className="text-xl font-bold mb-6">
            Goals{" "}
            <span className="text-muted-foreground font-normal text-base">
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
            <h2 className="text-xl font-bold mb-6">Team Stats</h2>
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
