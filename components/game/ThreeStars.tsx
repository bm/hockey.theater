import Image from "next/image";
import type { ThreeStar } from "@/types/game";

const STAR_LABELS = ["1st Star", "2nd Star", "3rd Star"];
const STAR_COLORS = ["#FFD700", "#C0C0C0", "#CD7F32"] as const;

interface ThreeStarsProps {
  stars: ThreeStar[];
}

export function ThreeStars({ stars }: ThreeStarsProps) {
  if (stars.length === 0) return null;

  return (
    <div>
      <h3 className="font-display font-bold text-sm uppercase tracking-widest text-muted-foreground mb-5">
        Stars of the Game
      </h3>
      <div className="flex gap-6 justify-center flex-wrap">
        {stars.map((star) => (
          <div
            key={star.star}
            className="flex flex-col items-center gap-2 text-center"
          >
            <div className="relative">
              {star.headshot && (
                <Image
                  src={star.headshot}
                  alt={star.name}
                  width={64}
                  height={64}
                  className="rounded-full ring-2 ring-border"
                  unoptimized
                />
              )}
              <span
                className="absolute -bottom-1 -right-1 text-xs rounded-full w-5 h-5 flex items-center justify-center font-display font-bold text-xs shadow-md"
                style={{
                  backgroundColor: STAR_COLORS[star.star - 1],
                  color: star.star === 1 ? "#1a1400" : "#1a1a1a",
                }}
              >
                {star.star}
              </span>
            </div>
            <div>
              <div className="text-sm font-semibold">{star.name}</div>
              <div className="text-xs text-muted-foreground font-medium">{star.teamAbbrev}</div>
              <div className="text-xs text-muted-foreground font-display font-semibold tabular-nums">
                {star.goals}G {star.assists}A
              </div>
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
              {STAR_LABELS[star.star - 1]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
