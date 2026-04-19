"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import type { NormalizedGame } from "@/types/game";
import { formatGameTime } from "@/lib/dates";
import { useHideScores } from "@/store";
import { cn } from "@/lib/utils";
import { Eye } from "lucide-react";

interface TeamScoreProps {
  team: NormalizedGame["awayTeam"] | NormalizedGame["homeTeam"];
  score?: number;
  hideScores: boolean;
  revealed: boolean;
  isFinal: boolean;
}

function TeamRow({ team, score, hideScores, revealed, isFinal }: TeamScoreProps) {
  const showScore = isFinal && score !== undefined;

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 min-w-0">
        <Image
          src={team.darkLogo || team.logo}
          alt={team.name}
          width={28}
          height={28}
          className="hidden dark:block flex-shrink-0"
          unoptimized
        />
        <Image
          src={team.logo}
          alt={team.name}
          width={28}
          height={28}
          className="dark:hidden flex-shrink-0"
          unoptimized
        />
        <div className="min-w-0">
          <div className="font-medium text-sm truncate">{team.shortName}</div>
          {team.record && (
            <div className="text-xs text-muted-foreground">{team.record}</div>
          )}
        </div>
      </div>

      {showScore && (
        <div className="font-mono font-bold text-xl tabular-nums">
          {hideScores && !revealed ? (
            <span className="text-muted-foreground">?</span>
          ) : (
            score
          )}
        </div>
      )}
    </div>
  );
}

function GameStatusBadge({ game }: { game: NormalizedGame }) {
  if (game.gameState === "postponed") {
    return <Badge variant="secondary">PPD</Badge>;
  }
  if (game.gameState === "cancelled") {
    return <Badge variant="destructive">Cancelled</Badge>;
  }
  if (game.gameState === "live" || game.gameState === "critical") {
    const period = game.period ?? 1;
    const periodLabel =
      game.periodType === "OT"
        ? "OT"
        : game.periodType === "SO"
          ? "SO"
          : `P${period}`;
    return (
      <Badge className="bg-red-600 text-white animate-pulse border-0">
        LIVE · {periodLabel}
      </Badge>
    );
  }
  if (game.gameState === "final") {
    const suffix = game.gameOutcome === "OT" ? "/OT" : game.gameOutcome === "SO" ? "/SO" : "";
    return (
      <Badge variant="outline" className="text-xs">
        Final{suffix}
      </Badge>
    );
  }
  return null;
}

interface GameCardProps {
  game: NormalizedGame;
}

export function GameCard({ game }: GameCardProps) {
  const hideScores = useHideScores();
  const [revealed, setRevealed] = useState(false);
  const isFinal = game.gameState === "final";
  const isLive = game.gameState === "live" || game.gameState === "critical";
  const isScheduled = game.gameState === "scheduled";

  const cardContent = (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-4 flex flex-col gap-3 transition-all",
        "hover:border-border/80 hover:shadow-md",
        game.gameState === "postponed" && "opacity-60",
        (isLive || game.gameState === "critical") &&
          "border-red-500/30 bg-red-950/5"
      )}
    >
      {/* Status row */}
      <div className="flex items-center justify-between gap-2">
        <GameStatusBadge game={game} />
        {isScheduled && (
          <span className="text-xs text-muted-foreground">
            {formatGameTime(game.startTimeUTC)}
          </span>
        )}
        {game.isPlayoffs && game.seriesStatus && (
          <span className="text-xs text-muted-foreground truncate max-w-[140px]">
            {game.seriesStatus}
          </span>
        )}
        {hideScores && isFinal && !revealed && (
          <button
            onClick={(e) => {
              e.preventDefault();
              setRevealed(true);
            }}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <Eye className="h-3 w-3" />
            Reveal
          </button>
        )}
      </div>

      {/* Teams */}
      <div className="flex flex-col gap-2">
        <TeamRow
          team={game.awayTeam}
          score={game.awayTeam.score}
          hideScores={hideScores}
          revealed={revealed}
          isFinal={isFinal || isLive}
        />
        <TeamRow
          team={game.homeTeam}
          score={game.homeTeam.score}
          hideScores={hideScores}
          revealed={revealed}
          isFinal={isFinal || isLive}
        />
      </div>

      {/* Broadcasts */}
      {game.broadcasts.length > 0 && (
        <div className="flex gap-1 flex-wrap">
          {game.broadcasts.map((network) => (
            <span
              key={network}
              className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded"
            >
              {network}
            </span>
          ))}
        </div>
      )}
    </div>
  );

  if (isFinal || isLive) {
    return (
      <Link href={`/game/${game.id}`} className="block">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}

export function GameCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3 animate-pulse">
      <div className="h-5 w-16 bg-muted rounded" />
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 bg-muted rounded-full" />
            <div className="h-4 w-20 bg-muted rounded" />
          </div>
          <div className="h-6 w-8 bg-muted rounded" />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 bg-muted rounded-full" />
            <div className="h-4 w-20 bg-muted rounded" />
          </div>
          <div className="h-6 w-8 bg-muted rounded" />
        </div>
      </div>
    </div>
  );
}
