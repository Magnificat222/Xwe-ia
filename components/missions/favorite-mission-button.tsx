"use client";

import { useEffect } from "react";
import { Heart } from "lucide-react";
import { useFavoritesStore } from "@/hooks/use-favorites-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function FavoriteMissionButton({ missionId }: { missionId: string }) {
  const { isFavorite, toggleMission, hydrate } = useFavoritesStore();
  const favorited = isFavorite(missionId);

  useEffect(() => {
    fetch("/api/favorites")
      .then((res) => (res.ok ? res.json() : { favorites: [] }))
      .then((data: { favorites: { missionId: string | null }[] }) => {
        const ids = data.favorites.map((f) => f.missionId).filter(Boolean) as string[];
        hydrate(ids);
      })
      .catch(() => {
        /* not logged in or network error: leave favorites empty */
      });
  }, [hydrate]);

  return (
    <Button
      variant="secondary"
      size="lg"
      onClick={() => toggleMission(missionId)}
      className={cn(favorited && "border-or/50 text-or")}
    >
      <Heart size={16} fill={favorited ? "currentColor" : "none"} />
      {favorited ? "Dans vos favoris" : "Ajouter aux favoris"}
    </Button>
  );
}
