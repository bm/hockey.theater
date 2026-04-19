"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useAppStore } from "@/store";
import { NHL_TEAMS_LIST } from "@/lib/team-colors";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export function FavoriteTeamModal() {
  const { hasChosenTeam, setFavoriteTeam, dismissTeamPicker } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || hasChosenTeam) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl">
        <button
          onClick={dismissTeamPicker}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-bold mb-1">Choose your team</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Your team&apos;s games will appear first in the schedule.
        </p>

        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-80 overflow-y-auto pr-1">
          {NHL_TEAMS_LIST.map((team) => (
            <button
              key={team.abbrev}
              onClick={() => setFavoriteTeam(team.abbrev)}
              className="flex flex-col items-center gap-1 rounded-lg p-2 hover:bg-accent transition-colors group"
              title={team.fullName}
            >
              <Image
                src={team.darkLogoUrl}
                alt={team.fullName}
                width={40}
                height={40}
                className="hidden dark:block"
                unoptimized
              />
              <Image
                src={team.logoUrl}
                alt={team.fullName}
                width={40}
                height={40}
                className="dark:hidden"
                unoptimized
              />
              <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">
                {team.abbrev}
              </span>
            </button>
          ))}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={dismissTeamPicker}
          className="mt-4 w-full text-muted-foreground"
        >
          Skip — show all teams
        </Button>
      </div>
    </div>
  );
}
