import { create } from "zustand";

interface FavoritesState {
  missionIds: Set<string>;
  hydrate: (ids: string[]) => void;
  toggleMission: (missionId: string) => Promise<void>;
  isFavorite: (id: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  missionIds: new Set(),

  hydrate: (ids: string[]) => set({ missionIds: new Set(ids) }),

  toggleMission: async (missionId: string) => {
    // Optimistic update first, so the UI feels instant.
    set((state) => {
      const next = new Set(state.missionIds);
      next.has(missionId) ? next.delete(missionId) : next.add(missionId);
      return { missionIds: next };
    });

    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ missionId }),
      });

      if (!res.ok) throw new Error("Échec de la mise à jour des favoris.");
    } catch (err) {
      // Roll back on failure.
      set((state) => {
        const next = new Set(state.missionIds);
        next.has(missionId) ? next.delete(missionId) : next.add(missionId);
        return { missionIds: next };
      });
      console.error(err);
    }
  },

  isFavorite: (id: string) => get().missionIds.has(id),
}));
