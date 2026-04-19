import type { TeamStat, GameDetail } from "@/types/game";
import { cn } from "@/lib/utils";

const STAT_LABELS: Record<string, string> = {
  sog: "Shots on Goal",
  faceoffWinningPctg: "Faceoff %",
  powerPlayPctg: "Power Play",
  pim: "Penalty Minutes",
  hits: "Hits",
  blocks: "Blocks",
  giveaways: "Giveaways",
  takeaways: "Takeaways",
};

interface StatBarProps {
  label: string;
  awayValue: string | number;
  homeValue: string | number;
  awayAbbrev: string;
  homeAbbrev: string;
}

function StatBar({ label, awayValue, homeValue, awayAbbrev, homeAbbrev }: StatBarProps) {
  const away = parseFloat(String(awayValue)) || 0;
  const home = parseFloat(String(homeValue)) || 0;
  const total = away + home;
  const awayPct = total > 0 ? (away / total) * 100 : 50;

  const displayLabel = STAT_LABELS[label] ?? label;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{awayValue}</span>
        <span className="text-xs text-muted-foreground">{displayLabel}</span>
        <span className="font-medium">{homeValue}</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all"
          style={{ width: `${awayPct}%` }}
        />
      </div>
    </div>
  );
}

interface TeamStatsProps {
  stats: TeamStat[];
  awayTeam: GameDetail["awayTeam"];
  homeTeam: GameDetail["homeTeam"];
}

export function TeamStats({ stats, awayTeam, homeTeam }: TeamStatsProps) {
  if (stats.length === 0) return null;

  return (
    <div>
      <div className="flex justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
        <span>{awayTeam.abbrev}</span>
        <span>Stats</span>
        <span>{homeTeam.abbrev}</span>
      </div>
      <div className="flex flex-col gap-3">
        {stats.map((stat) => (
          <StatBar
            key={stat.category}
            label={stat.category}
            awayValue={stat.awayValue}
            homeValue={stat.homeValue}
            awayAbbrev={awayTeam.abbrev}
            homeAbbrev={homeTeam.abbrev}
          />
        ))}
      </div>
    </div>
  );
}
