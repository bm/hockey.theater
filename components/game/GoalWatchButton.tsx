"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, Play, ChevronLeft, ChevronRight } from "lucide-react";
import type { GoalClip } from "@/types/game";
import { HlsPlayer } from "./HlsPlayer";

const PERIOD_LABEL: Record<number, string> = {
  1: "1st",
  2: "2nd",
  3: "3rd",
  4: "OT",
  5: "SO",
};

const STRENGTH_LABEL: Record<string, string> = {
  pp: "PP · ",
  sh: "SH · ",
  ev: "",
};

interface GoalWatchButtonProps {
  goals: GoalClip[];
  index: number;
}

export function GoalWatchButton({ goals, index }: GoalWatchButtonProps) {
  const [open, setOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(index);

  const goal = goals[index];

  function openModal() {
    setCurrentIndex(index);
    setOpen(true);
  }

  function prev() {
    setCurrentIndex((i) => (i - 1 + goals.length) % goals.length);
  }

  function next() {
    setCurrentIndex((i) => (i + 1) % goals.length);
  }

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!goal.milestoneId) return null;

  const current = goals[currentIndex];
  const periodStr = PERIOD_LABEL[current.period] ?? `P${current.period}`;
  const strengthStr = STRENGTH_LABEL[current.strength] ?? "";
  const total = goals.length;

  return (
    <>
      <button
        onClick={openModal}
        className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-semibold transition-colors mt-0.5"
      >
        <Play className="h-3 w-3 fill-current" />
        Watch
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/85 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-6xl bg-card rounded-xl border border-border overflow-hidden shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Goal info header */}
            <div className="flex items-center gap-3 p-4 border-b border-border">
              {current.scorerHeadshot && (
                <Image
                  src={current.scorerHeadshot}
                  alt={current.scorer}
                  width={44}
                  height={44}
                  className="rounded-full ring-2 ring-border flex-shrink-0"
                  unoptimized
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{current.scorer}</div>
                <div className="text-xs text-muted-foreground font-medium">
                  {strengthStr}{periodStr} · {current.timeInPeriod} · {current.awayScore}–{current.homeScore}
                </div>
                {current.assists.length > 0 && (
                  <div className="text-xs text-muted-foreground truncate">
                    {current.assists.join(", ")}
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={prev}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1"
                  aria-label="Previous goal"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="text-xs text-muted-foreground font-medium tabular-nums w-10 text-center">
                  {currentIndex + 1}/{total}
                </span>
                <button
                  onClick={next}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1"
                  aria-label="Next goal"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1 ml-1"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Video */}
            <div className="relative w-full aspect-video bg-black">
              <HlsPlayer key={current.milestoneId} milestoneId={current.milestoneId!} autoPlay />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
