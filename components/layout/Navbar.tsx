"use client";

import Link from "next/link";
import { Eye, EyeOff, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useAppStore } from "@/store";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useEffect, useState } from "react";

export function Navbar() {
  const { hideScores, toggleHideScores } = useAppStore();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5 group">
          <Image
            src="/icon.png"
            alt="hockey.theater"
            width={32}
            height={32}
            className="transition-transform group-hover:scale-110"
            unoptimized
          />
          <span className="font-display font-bold text-xl uppercase tracking-widest">
            hockey<span className="text-primary">.</span><span className="text-muted-foreground font-semibold normal-case tracking-normal text-lg">theater</span>
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleHideScores}
            title={hideScores ? "Show scores" : "Hide scores"}
            className="gap-2 text-xs font-medium"
          >
            {hideScores ? (
              <>
                <EyeOff className="h-4 w-4" />
                <span className="hidden sm:inline">Scores hidden</span>
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">Hide scores</span>
              </>
            )}
          </Button>

          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              className="h-9 w-9"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>
      <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
    </header>
  );
}
