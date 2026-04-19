import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import type { GameDetail } from "@/types/game";
import { formatDisplayDate, formatGameTime } from "@/lib/dates";

interface GameHeroProps {
  game: GameDetail;
}

function periodLabel(period: number, periodType: string): string {
  if (periodType === "SO") return "Shootout";
  if (periodType === "OT") return "Overtime";
  return `Period ${period}`;
}

export function GameHero({ game }: GameHeroProps) {
  const isFinal = game.gameState === "final";
  const isLive = game.gameState === "live";

  const outcomeSuffix =
    game.periodType === "OT"
      ? " (OT)"
      : game.periodType === "SO"
        ? " (SO)"
        : "";

  return (
    <div className="w-full py-8 border-b border-border">
      <div className="mx-auto max-w-4xl px-4">
        {/* Date + Venue */}
        <div className="text-center text-sm text-muted-foreground mb-6">
          <span>{formatDisplayDate(game.date)}</span>
          {game.venue && <span> · {game.venue}</span>}
          {!isFinal && !isLive && (
            <span> · {formatGameTime(game.startTimeUTC)}</span>
          )}
        </div>

        {/* Teams + Score */}
        <div className="flex items-center justify-between gap-4">
          {/* Away Team */}
          <div className="flex flex-col items-center gap-2 flex-1">
            <Image
              src={game.awayTeam.darkLogo || game.awayTeam.logo}
              alt={game.awayTeam.name}
              width={80}
              height={80}
              className="hidden dark:block"
              unoptimized
            />
            <Image
              src={game.awayTeam.logo}
              alt={game.awayTeam.name}
              width={80}
              height={80}
              className="dark:hidden"
              unoptimized
            />
            <div className="text-center">
              <div className="font-bold text-lg">{game.awayTeam.shortName}</div>
              {game.awayTeam.record && (
                <div className="text-xs text-muted-foreground">
                  {game.awayTeam.record}
                </div>
              )}
            </div>
          </div>

          {/* Score */}
          <div className="flex flex-col items-center gap-2 min-w-[120px]">
            {(isFinal || isLive) &&
              game.awayTeam.score !== undefined &&
              game.homeTeam.score !== undefined ? (
              <div className="flex items-center gap-4 font-mono font-black text-5xl tabular-nums">
                <span>{game.awayTeam.score}</span>
                <span className="text-muted-foreground text-3xl">–</span>
                <span>{game.homeTeam.score}</span>
              </div>
            ) : (
              <div className="text-muted-foreground text-2xl">vs</div>
            )}

            {isFinal && (
              <Badge variant="outline">Final{outcomeSuffix}</Badge>
            )}
            {isLive && game.period && (
              <Badge className="bg-red-600 text-white animate-pulse border-0">
                LIVE · {game.period && game.periodType ? periodLabel(game.period, game.periodType) : "Live"}
              </Badge>
            )}
          </div>

          {/* Home Team */}
          <div className="flex flex-col items-center gap-2 flex-1">
            <Image
              src={game.homeTeam.darkLogo || game.homeTeam.logo}
              alt={game.homeTeam.name}
              width={80}
              height={80}
              className="hidden dark:block"
              unoptimized
            />
            <Image
              src={game.homeTeam.logo}
              alt={game.homeTeam.name}
              width={80}
              height={80}
              className="dark:hidden"
              unoptimized
            />
            <div className="text-center">
              <div className="font-bold text-lg">{game.homeTeam.shortName}</div>
              {game.homeTeam.record && (
                <div className="text-xs text-muted-foreground">
                  {game.homeTeam.record}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Team stats mini row */}
        {(game.awayTeam.sog !== undefined || game.homeTeam.sog !== undefined) && (
          <div className="flex justify-center gap-8 mt-4 text-sm text-muted-foreground">
            {game.awayTeam.sog !== undefined && (
              <span>{game.awayTeam.sog} SOG</span>
            )}
            {game.awayTeam.hits !== undefined && (
              <span>{game.awayTeam.hits} hits</span>
            )}
            <span className="text-border">|</span>
            {game.homeTeam.hits !== undefined && (
              <span>{game.homeTeam.hits} hits</span>
            )}
            {game.homeTeam.sog !== undefined && (
              <span>{game.homeTeam.sog} SOG</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
