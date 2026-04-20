import type { TeamStat, GameDetail } from "@/types/game";

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
  awayColor: string;
  homeColor: string;
}

function StatBar({ label, awayValue, homeValue, awayColor, homeColor }: StatBarProps) {
  const away = parseFloat(String(awayValue)) || 0;
  const home = parseFloat(String(homeValue)) || 0;
  const total = away + home;
  const awayPct = total > 0 ? (away / total) * 100 : 50;

  const displayLabel = STAT_LABELS[label] ?? label;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between text-sm">
        <span className="font-display font-semibold text-base tabular-nums">{awayValue}</span>
        <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{displayLabel}</span>
        <span className="font-display font-semibold text-base tabular-nums">{homeValue}</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden flex">
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${awayPct}%`, backgroundColor: awayColor }}
        />
        <div
          className="h-full transition-all duration-500 flex-1"
          style={{ backgroundColor: homeColor }}
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
      <div className="flex justify-between text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-5">
        <span
          className="font-display text-sm font-bold"
          style={{ color: awayTeam.primaryColor }}
        >
          {awayTeam.abbrev}
        </span>
        <span>Stats</span>
        <span
          className="font-display text-sm font-bold"
          style={{ color: homeTeam.primaryColor }}
        >
          {homeTeam.abbrev}
        </span>
      </div>
      <div className="flex flex-col gap-4">
        {stats.map((stat) => (
          <StatBar
            key={stat.category}
            label={stat.category}
            awayValue={stat.awayValue}
            homeValue={stat.homeValue}
            awayAbbrev={awayTeam.abbrev}
            homeAbbrev={homeTeam.abbrev}
            awayColor={awayTeam.primaryColor}
            homeColor={homeTeam.primaryColor}
          />
        ))}
      </div>
    </div>
  );
}
