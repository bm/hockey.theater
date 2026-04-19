"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useFavoriteTeam } from "@/store";
import { NHL_TEAMS_LIST } from "@/lib/team-colors";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface TeamFilterBarProps {
  selectedTeam: string | null;
}

export function TeamFilterBar({ selectedTeam }: TeamFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const favoriteTeam = useFavoriteTeam();

  function selectTeam(abbrev: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (abbrev) {
      params.set("team", abbrev);
    } else {
      params.delete("team");
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  // Sort: favorite first, then alphabetical
  const sortedTeams = [...NHL_TEAMS_LIST].sort((a, b) => {
    if (a.abbrev === favoriteTeam) return -1;
    if (b.abbrev === favoriteTeam) return 1;
    return a.abbrev.localeCompare(b.abbrev);
  });

  return (
    <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4">
      <button
        onClick={() => selectTeam(null)}
        className={cn(
          "flex-shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors",
          selectedTeam === null
            ? "bg-foreground text-background"
            : "bg-muted text-muted-foreground hover:text-foreground"
        )}
      >
        All
      </button>

      {sortedTeams.map((team) => {
        const isFav = team.abbrev === favoriteTeam;
        const isSelected = selectedTeam === team.abbrev;
        return (
          <button
            key={team.abbrev}
            onClick={() => selectTeam(isSelected ? null : team.abbrev)}
            className={cn(
              "flex-shrink-0 flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors",
              isSelected
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {isFav && <Star className="h-2.5 w-2.5 fill-current" />}
            {team.abbrev}
          </button>
        );
      })}
    </div>
  );
}
