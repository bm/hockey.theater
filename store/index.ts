"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppState {
  hideScores: boolean;
  favoriteTeam: string | null; // team abbrev e.g. "BOS"
  hasChosenTeam: boolean; // whether user has dismissed the team picker modal

  setHideScores: (v: boolean) => void;
  toggleHideScores: () => void;
  setFavoriteTeam: (abbrev: string | null) => void;
  dismissTeamPicker: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      hideScores: false,
      favoriteTeam: null,
      hasChosenTeam: false,

      setHideScores: (v) => set({ hideScores: v }),
      toggleHideScores: () => set((s) => ({ hideScores: !s.hideScores })),
      setFavoriteTeam: (abbrev) =>
        set({ favoriteTeam: abbrev, hasChosenTeam: true }),
      dismissTeamPicker: () => set({ hasChosenTeam: true }),
    }),
    {
      name: "hockey-theater-prefs",
      partialize: (s) => ({
        hideScores: s.hideScores,
        favoriteTeam: s.favoriteTeam,
        hasChosenTeam: s.hasChosenTeam,
      }),
    }
  )
);

// Convenience selector hooks
export const useHideScores = () => useAppStore((s) => s.hideScores);
export const useFavoriteTeam = () => useAppStore((s) => s.favoriteTeam);
