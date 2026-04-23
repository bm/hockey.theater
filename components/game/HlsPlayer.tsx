"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

interface HlsPlayerProps {
  milestoneId: number;
  autoPlay?: boolean;
}

export function HlsPlayer({ milestoneId, autoPlay = false }: HlsPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/video/${milestoneId}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data: { hlsUrl: string }) => {
        if (cancelled || !videoRef.current) return;
        const video = videoRef.current;
        setState("ready");

        if (Hls.isSupported()) {
          const hls = new Hls({ startLevel: -1 });
          hlsRef.current = hls;
          hls.loadSource(data.hlsUrl);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            if (autoPlay) video.play().catch(() => {});
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          // Safari handles HLS natively
          video.src = data.hlsUrl;
          if (autoPlay) video.play().catch(() => {});
        }
      })
      .catch(() => {
        if (!cancelled) setState("error");
      });

    return () => {
      cancelled = true;
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
  }, [milestoneId]);

  return (
    <div className="absolute inset-0 bg-black">
      {state === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}
      {state === "error" ? (
        <div className="absolute inset-0 flex items-center justify-center text-white/50 text-sm">
          Video unavailable.
        </div>
      ) : (
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full"
          controls
          playsInline
          muted={autoPlay}
        />
      )}
    </div>
  );
}
