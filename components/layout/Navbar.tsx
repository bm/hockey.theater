"use client";

import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useAppStore, useFavoriteTeam } from "@/store";
import { getTeam } from "@/lib/team-colors";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export function Navbar() {
  const { hideScores, toggleHideScores } = useAppStore();
  const favoriteTeam = useFavoriteTeam();
  const team = favoriteTeam ? getTeam(favoriteTeam) : null;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          {team ? (
            <Image
              src={team.darkLogoUrl}
              alt={team.fullName}
              width={32}
              height={32}
              className="hidden dark:block"
              unoptimized
            />
          ) : (
            <span className="text-lg font-bold tracking-tight">🏒</span>
          )}
          <span className="font-bold tracking-tight text-lg">
            hockey<span className="text-muted-foreground">.theater</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleHideScores}
            title={hideScores ? "Show scores" : "Hide scores"}
            className="gap-2"
          >
            {hideScores ? (
              <>
                <EyeOff className="h-4 w-4" />
                <span className="hidden sm:inline text-xs">Scores hidden</span>
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline text-xs">Hide scores</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
