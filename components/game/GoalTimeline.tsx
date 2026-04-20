import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import type { GoalClip } from "@/types/game";
import { cn } from "@/lib/utils";
import { GoalWatchButton } from "./GoalWatchButton";

const STRENGTH_LABEL: Record<string, string> = {
  pp: "PP",
  sh: "SH",
  ev: "",
};

const PERIOD_LABEL: Record<number, string> = {
  1: "1st",
  2: "2nd",
  3: "3rd",
  4: "OT",
  5: "SO",
};

interface GoalTimelineProps {
  goals: GoalClip[];
  awayAbbrev: string;
  homeAbbrev: string;
}

export function GoalTimeline({ goals, awayAbbrev, homeAbbrev }: GoalTimelineProps) {
  if (goals.length === 0) {
    return (
      <p className="text-muted-foreground text-sm py-4">No goals yet.</p>
    );
  }

  const byPeriod = goals.reduce<Record<number, GoalClip[]>>((acc, goal) => {
    (acc[goal.period] ??= []).push(goal);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-8">
      {Object.entries(byPeriod).map(([periodStr, periodGoals]) => {
        const period = Number(periodStr);
        return (
          <div key={period}>
            <div className="flex items-center gap-3 mb-4">
              <span className="font-display font-bold text-sm uppercase tracking-widest text-muted-foreground">
                {PERIOD_LABEL[period] ?? `P${period}`} Period
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <div className="flex flex-col gap-2">
              {periodGoals.map((goal) => {
                const isHome = goal.teamAbbrev === homeAbbrev;
                const strengthLabel = STRENGTH_LABEL[goal.strength] ?? "";

                return (
                  <div
                    key={goal.eventId}
                    className={cn(
                      "flex flex-col gap-2 p-3.5 rounded-lg border border-border bg-card/50 hover:bg-card transition-colors"
                    )}
                  >
                    {/* Main row: headshot · scorer info · score */}
                    <div className={cn("flex items-start gap-3", isHome ? "flex-row-reverse" : "flex-row")}>
                      {goal.scorerHeadshot && (
                        <Image
                          src={goal.scorerHeadshot}
                          alt={goal.scorer}
                          width={40}
                          height={40}
                          className="rounded-full flex-shrink-0 ring-2 ring-border"
                          unoptimized
                        />
                      )}
                      <div className={cn("flex-1 min-w-0", isHome && "text-right")}>
                        <div className={cn("flex items-center gap-2 flex-wrap", isHome && "justify-end")}>
                          <span className="font-semibold text-sm">{goal.scorer}</span>
                          {strengthLabel && (
                            <Badge variant="secondary" className="text-xs font-semibold">
                              {strengthLabel}
                            </Badge>
                          )}
                        </div>
                        {goal.assists.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {goal.assists.join(", ")}
                          </p>
                        )}
                      </div>
                      <div className={cn("text-right flex-shrink-0", isHome && "text-left")}>
                        <div className="text-xs text-muted-foreground font-medium">
                          {goal.timeInPeriod}
                        </div>
                        <div className="font-display font-bold text-lg tabular-nums leading-tight">
                          {goal.awayScore}–{goal.homeScore}
                        </div>
                      </div>
                    </div>

                    {/* Watch button — centered */}
                    {goal.embedUrl && (
                      <div className="flex justify-center pt-0.5">
                        <GoalWatchButton goal={goal} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
