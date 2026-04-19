import type { Metadata } from "next";
import { Suspense } from "react";
import { fetchSchedule } from "@/lib/nhl-api/schedule";
import { formatDisplayDate } from "@/lib/dates";
import { DateNav } from "@/components/layout/DateNav";
import { ScheduleGrid } from "@/components/schedule/ScheduleGrid";
import { TeamFilterBar } from "@/components/schedule/TeamFilterBar";
import { GameCardSkeleton } from "@/components/schedule/GameCard";

interface PageProps {
  params: Promise<{ date: string }>;
  searchParams: Promise<{ team?: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { date } = await params;
  return {
    title: `NHL Games — ${formatDisplayDate(date)}`,
  };
}

export const revalidate = 60;
export const dynamicParams = true;

export default async function SchedulePage({ params, searchParams }: PageProps) {
  const { date } = await params;
  const { team } = await searchParams;
  const teamFilter = team?.toUpperCase() ?? null;

  // Prefetch on server for initial paint — client takes over for live updates
  let initialGames;
  try {
    initialGames = await fetchSchedule(date);
  } catch {
    initialGames = undefined;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-12">
      <DateNav date={date} />

      <Suspense fallback={null}>
        <TeamFilterBar selectedTeam={teamFilter} />
      </Suspense>

      <div className="mt-4">
        <Suspense
          fallback={
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <GameCardSkeleton key={i} />
              ))}
            </div>
          }
        >
          <ScheduleGrid
            date={date}
            teamFilter={teamFilter}
            initialGames={initialGames}
          />
        </Suspense>
      </div>
    </div>
  );
}
