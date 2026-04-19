import Image from "next/image";
import type { ThreeStar } from "@/types/game";

const STAR_LABELS = ["1st Star", "2nd Star", "3rd Star"];

interface ThreeStarsProps {
  stars: ThreeStar[];
}

export function ThreeStars({ stars }: ThreeStarsProps) {
  if (stars.length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
        Three Stars
      </h3>
      <div className="flex gap-4 justify-center flex-wrap">
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
                  width={56}
                  height={56}
                  className="rounded-full"
                  unoptimized
                />
              )}
              <span className="absolute -bottom-1 -right-1 text-xs bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {star.star}
              </span>
            </div>
            <div>
              <div className="text-sm font-medium">{star.name}</div>
              <div className="text-xs text-muted-foreground">{star.teamAbbrev}</div>
              <div className="text-xs text-muted-foreground">
                {star.goals}G {star.assists}A
              </div>
            </div>
            <div className="text-xs text-muted-foreground">{STAR_LABELS[star.star - 1]}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
