"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, Play } from "lucide-react";
import type { GoalClip } from "@/types/game";

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
  goal: GoalClip;
}

export function GoalWatchButton({ goal }: GoalWatchButtonProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!goal.embedUrl) return null;

  // Append autoStart so video plays immediately when modal opens
  const autoplayUrl = `${goal.embedUrl}&autoStart=true`;

  const periodStr = PERIOD_LABEL[goal.period] ?? `P${goal.period}`;
  const strengthStr = STRENGTH_LABEL[goal.strength] ?? "";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
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
              {goal.scorerHeadshot && (
                <Image
                  src={goal.scorerHeadshot}
                  alt={goal.scorer}
                  width={44}
                  height={44}
                  className="rounded-full ring-2 ring-border flex-shrink-0"
                  unoptimized
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{goal.scorer}</div>
                <div className="text-xs text-muted-foreground font-medium">
                  {strengthStr}{periodStr} · {goal.timeInPeriod} · {goal.awayScore}–{goal.homeScore}
                </div>
                {goal.assists.length > 0 && (
                  <div className="text-xs text-muted-foreground truncate">
                    {goal.assists.join(", ")}
                  </div>
                )}
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 flex-shrink-0"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Video */}
            <div className="relative w-full aspect-video bg-black">
              <iframe
                key={goal.eventId}
                src={autoplayUrl}
                title={`${goal.scorer} goal highlight`}
                className="absolute inset-0 w-full h-full"
                allowFullScreen
                allow="autoplay; fullscreen"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
