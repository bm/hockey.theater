import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import type { GoalClip } from "@/types/game";
import { cn } from "@/lib/utils";

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

  // Group by period
  const byPeriod = goals.reduce<Record<number, GoalClip[]>>((acc, goal) => {
    (acc[goal.period] ??= []).push(goal);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-6">
      {Object.entries(byPeriod).map(([periodStr, periodGoals]) => {
        const period = Number(periodStr);
        return (
          <div key={period}>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              {PERIOD_LABEL[period] ?? `P${period}`} Period
            </div>
            <div className="flex flex-col gap-2">
              {periodGoals.map((goal) => {
                const isHome = goal.teamAbbrev === homeAbbrev;
                const strengthLabel = STRENGTH_LABEL[goal.strength] ?? "";

                return (
                  <div
                    key={goal.eventId}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg border border-border",
                      isHome ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    {goal.scorerHeadshot && (
                      <Image
                        src={goal.scorerHeadshot}
                        alt={goal.scorer}
                        width={40}
                        height={40}
                        className="rounded-full flex-shrink-0"
                        unoptimized
                      />
                    )}
                    <div className={cn("flex-1 min-w-0", isHome && "text-right")}>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{goal.scorer}</span>
                        {strengthLabel && (
                          <Badge variant="secondary" className="text-xs">
                            {strengthLabel}
                          </Badge>
                        )}
                      </div>
                      {goal.assists.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {goal.assists.join(", ")}
                        </p>
                      )}
                    </div>
                    <div className={cn("text-right flex-shrink-0", isHome && "text-left")}>
                      <div className="text-xs text-muted-foreground">
                        {goal.timeInPeriod}
                      </div>
                      <div className="text-sm font-mono font-bold">
                        {goal.awayScore}–{goal.homeScore}
                      </div>
                      {goal.highlightClipSharingUrl && (
                        <a
                          href={goal.highlightClipSharingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline"
                        >
                          ▶ Watch
                        </a>
                      )}
                    </div>
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
