"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { VideoClip } from "@/types/game";
import { HlsPlayer } from "./HlsPlayer";

interface RecapSectionProps {
  threeMinRecap?: VideoClip;
  condensedGame?: VideoClip;
}

function VideoEmbed({ clip }: { clip: VideoClip }) {
  if (!clip.milestoneId) {
    return (
      <div className="flex items-center justify-center h-48 bg-muted rounded-lg text-muted-foreground text-sm">
        Video not yet available — check back soon.
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
      <HlsPlayer milestoneId={clip.milestoneId} />
    </div>
  );
}

export function RecapSection({ threeMinRecap, condensedGame }: RecapSectionProps) {
  if (!threeMinRecap && !condensedGame) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground text-sm">
          Highlights not yet available. Check back ~2 hours after the game ends.
        </p>
      </div>
    );
  }

  const hasMultiple = threeMinRecap && condensedGame;

  if (!hasMultiple) {
    const clip = threeMinRecap ?? condensedGame!;
    return (
      <div>
        <h2 className="text-lg font-semibold mb-4">{clip.title}</h2>
        <VideoEmbed clip={clip} />
      </div>
    );
  }

  return (
    <Tabs defaultValue="recap">
      <TabsList className="mb-4">
        <TabsTrigger value="recap">Recap</TabsTrigger>
        <TabsTrigger value="condensed">Condensed Game</TabsTrigger>
      </TabsList>
      <TabsContent value="recap">
        <VideoEmbed clip={threeMinRecap!} />
      </TabsContent>
      <TabsContent value="condensed">
        <VideoEmbed clip={condensedGame!} />
      </TabsContent>
    </Tabs>
  );
}
