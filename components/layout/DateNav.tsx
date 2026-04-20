"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatDisplayDate, nextDay, prevDay, isToday } from "@/lib/dates";
import { cn } from "@/lib/utils";

interface DateNavProps {
  date: string;
}

export function DateNav({ date }: DateNavProps) {
  const today = isToday(date);

  return (
    <div className="flex items-center justify-between gap-4 py-5">
      <Link
        href={`/games/${prevDay(date)}`}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors p-2 -ml-2 rounded-lg hover:bg-accent"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline font-medium">Previous</span>
      </Link>

      <div className="flex flex-col items-center gap-1.5">
        <h1 className="font-display font-bold text-2xl sm:text-3xl uppercase tracking-wider">
          {formatDisplayDate(date)}
        </h1>
        {!today && (
          <Link
            href="/games"
            className={cn(
              "text-xs px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground hover:text-foreground transition-colors font-medium"
            )}
          >
            Go to today
          </Link>
        )}
        {today && (
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/15 text-primary font-semibold tracking-wide uppercase">
            Today
          </span>
        )}
      </div>

      <Link
        href={`/games/${nextDay(date)}`}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors p-2 -mr-2 rounded-lg hover:bg-accent"
      >
        <span className="hidden sm:inline font-medium">Next</span>
        <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
