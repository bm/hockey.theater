import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import type { GameDetail } from "@/types/game";
import { formatDisplayDate, formatGameTime } from "@/lib/dates";

interface GameHeroProps {
  game: GameDetail;
}

const PERIOD_COL_LABEL = ["1", "2", "3", "OT", "2OT", "3OT"];

function PeriodBoxScore({ game }: { game: GameDetail }) {
  const away = game.awayTeam.goalsByPeriod ?? [];
  const home = game.homeTeam.goalsByPeriod ?? [];
  const numPeriods = Math.max(away.length, home.length);
  if (numPeriods === 0) return null;

  return (
    <div className="mt-6 flex justify-center">
      <table className="text-sm font-display tabular-nums border-collapse">
        <thead>
          <tr className="text-xs text-muted-foreground uppercase tracking-wider">
            <th className="text-left pr-6 pb-1 font-semibold w-16" />
            {Array.from({ length: numPeriods }, (_, i) => (
              <th key={i} className="w-10 text-center pb-1 font-semibold">
                {PERIOD_COL_LABEL[i] ?? `P${i + 1}`}
              </th>
            ))}
            <th className="w-10 text-center pb-1 font-bold pl-2 border-l border-border">T</th>
          </tr>
        </thead>
        <tbody>
          {[
            { team: game.awayTeam, goals: away },
            { team: game.homeTeam, goals: home },
          ].map(({ team, goals }) => (
            <tr key={team.abbrev}>
              <td className="pr-6 py-0.5 font-bold text-xs tracking-wide">{team.abbrev}</td>
              {Array.from({ length: numPeriods }, (_, i) => (
                <td key={i} className="w-10 text-center py-0.5 text-muted-foreground">
                  {goals[i] ?? 0}
                </td>
              ))}
              <td className="w-10 text-center py-0.5 font-bold pl-2 border-l border-border">
                {team.score ?? goals.reduce((a, b) => a + b, 0)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function periodLabel(period: number, periodType: string): string {
  if (periodType === "SO") return "Shootout";
  if (periodType === "OT") return "Overtime";
  return `Period ${period}`;
}

export function GameHero({ game }: GameHeroProps) {
  const isFinal = game.gameState === "final";
  const isLive = game.gameState === "live" || game.gameState === "critical";

  const outcomeSuffix =
    game.periodType === "OT"
      ? " (OT)"
      : game.periodType === "SO"
        ? " (SO)"
        : "";

  return (
    <div className="w-full relative overflow-hidden py-12 border-b border-border/40">
      {/* Team color ambient background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(to right, ${game.awayTeam.primaryColor}40 0%, transparent 45%, transparent 55%, ${game.homeTeam.primaryColor}40 100%)`,
        }}
      />

      <div className="relative mx-auto max-w-4xl px-4">
        {/* Date + Venue */}
        <div className="text-center text-sm text-muted-foreground mb-8 font-medium">
          <span>{formatDisplayDate(game.date)}</span>
          {game.venue && <span> · {game.venue}</span>}
          {!isFinal && !isLive && (
            <span> · {formatGameTime(game.startTimeUTC)}</span>
          )}
        </div>

        {/* Teams + Score */}
        <div className="flex items-center justify-between gap-4 sm:gap-8">
          {/* Away Team */}
          <div className="flex flex-col items-center gap-3 flex-1">
            <Image
              src={game.awayTeam.darkLogo || game.awayTeam.logo}
              alt={game.awayTeam.name}
              width={96}
              height={96}
              className="hidden dark:block drop-shadow-lg"
              unoptimized
            />
            <Image
              src={game.awayTeam.logo}
              alt={game.awayTeam.name}
              width={96}
              height={96}
              className="dark:hidden drop-shadow-lg"
              unoptimized
            />
            <div className="text-center">
              <div className="font-display font-bold text-xl sm:text-2xl uppercase tracking-wider leading-tight">
                {game.awayTeam.shortName}
              </div>
              {game.awayTeam.record && (
                <div className="text-xs text-muted-foreground mt-0.5 font-medium">
                  {game.awayTeam.record}
                </div>
              )}
            </div>
          </div>

          {/* Score center */}
          <div className="flex flex-col items-center gap-3 min-w-[140px] sm:min-w-[180px]">
            {(isFinal || isLive) &&
            game.awayTeam.score !== undefined &&
            game.homeTeam.score !== undefined ? (
              <div className="flex items-center gap-4 sm:gap-6 font-display font-black leading-none">
                <span className="text-6xl sm:text-8xl tabular-nums">{game.awayTeam.score}</span>
                <span className="text-muted-foreground text-3xl sm:text-4xl">–</span>
                <span className="text-6xl sm:text-8xl tabular-nums">{game.homeTeam.score}</span>
              </div>
            ) : (
              <div className="font-display text-muted-foreground text-3xl font-bold tracking-[0.3em]">
                VS
              </div>
            )}

            {isFinal && (
              <Badge variant="outline" className="text-xs font-semibold tracking-widest uppercase">
                FINAL{outcomeSuffix}
              </Badge>
            )}
            {isLive && (
              <Badge className="bg-red-600 text-white animate-pulse border-0 font-semibold tracking-wide">
                LIVE{game.period ? ` · ${periodLabel(game.period, game.periodType ?? "REG")}` : ""}
              </Badge>
            )}
          </div>

          {/* Home Team */}
          <div className="flex flex-col items-center gap-3 flex-1">
            <Image
              src={game.homeTeam.darkLogo || game.homeTeam.logo}
              alt={game.homeTeam.name}
              width={96}
              height={96}
              className="hidden dark:block drop-shadow-lg"
              unoptimized
            />
            <Image
              src={game.homeTeam.logo}
              alt={game.homeTeam.name}
              width={96}
              height={96}
              className="dark:hidden drop-shadow-lg"
              unoptimized
            />
            <div className="text-center">
              <div className="font-display font-bold text-xl sm:text-2xl uppercase tracking-wider leading-tight">
                {game.homeTeam.shortName}
              </div>
              {game.homeTeam.record && (
                <div className="text-xs text-muted-foreground mt-0.5 font-medium">
                  {game.homeTeam.record}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mini stats row */}
        {(game.awayTeam.sog !== undefined || game.homeTeam.sog !== undefined) && (
          <div className="flex justify-center gap-8 mt-6 text-sm text-muted-foreground font-medium">
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

        {/* Period box score */}
        {(game.awayTeam.goalsByPeriod || game.homeTeam.goalsByPeriod) && (
          <PeriodBoxScore game={game} />
        )}
      </div>
    </div>
  );
}
