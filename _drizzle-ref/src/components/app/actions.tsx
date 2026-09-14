"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Star, Play, Trash2, Pin, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import {
  startPathwayAction,
  toggleFavoriteAction,
  setCurrentGoalAction,
  deleteResultAction,
  togglePinResultAction,
  markAllReadAction,
} from "@/lib/actions/app";

export function StartPathwayButton({ slug }: { slug: string }) {
  const [pending, start] = useTransition();
  return (
    <Button
      size="lg"
      loading={pending}
      icon={<Play size={16} />}
      onClick={() => start(() => startPathwayAction(slug))}
    >
      Commencer ce parcours
    </Button>
  );
}

export function FavoriteButton({
  entityType,
  entityId,
  initial,
  compact = false,
}: {
  entityType: string;
  entityId: string;
  initial: boolean;
  compact?: boolean;
}) {
  const [favorited, setFavorited] = useState(initial);
  const [pending, start] = useTransition();
  const { push } = useToast();

  const toggle = () =>
    start(async () => {
      const result = await toggleFavoriteAction(entityType, entityId);
      setFavorited(result.favorited);
      push(result.favorited ? "Ajouté à tes favoris." : "Retiré de tes favoris.", "succes");
    });

  if (compact) {
    return (
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        aria-pressed={favorited}
        aria-label={favorited ? "Retirer des favoris" : "Ajouter aux favoris"}
        className="rounded-lg p-2 text-ivoire-faint transition-colors hover:bg-or/10 hover:text-or disabled:opacity-50"
      >
        <Star size={16} fill={favorited ? "currentColor" : "none"} className={favorited ? "text-or" : ""} />
      </button>
    );
  }

  return (
    <Button
      variant="secondary"
      size="lg"
      loading={pending}
      onClick={toggle}
      icon={<Star size={16} fill={favorited ? "currentColor" : "none"} />}
    >
      {favorited ? "En favori" : "Ajouter aux favoris"}
    </Button>
  );
}

export function SetGoalButton({ goalId, isCurrent }: { goalId: string; isCurrent: boolean }) {
  const [pending, start] = useTransition();
  const { push } = useToast();

  if (isCurrent) {
    return (
      <Button variant="secondary" size="lg" icon={<Check size={16} />} disabled>
        Objectif actuel
      </Button>
    );
  }

  return (
    <Button
      size="lg"
      loading={pending}
      onClick={() =>
        start(async () => {
          await setCurrentGoalAction(goalId);
          push("C'est noté : ton objectif est mis à jour.", "succes");
        })
      }
    >
      Choisir cet objectif
    </Button>
  );
}

export function ResultActions({ id, pinned }: { id: string; pinned: boolean }) {
  const [isPinned, setPinned] = useState(pinned);
  const [pending, start] = useTransition();
  const router = useRouter();
  const { push } = useToast();

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            await togglePinResultAction(id);
            setPinned((p) => !p);
          })
        }
        aria-pressed={isPinned}
        aria-label={isPinned ? "Ne plus épingler" : "Épingler"}
        className="rounded-lg p-2 text-ivoire-faint transition-colors hover:bg-or/10 hover:text-or"
      >
        <Pin size={15} fill={isPinned ? "currentColor" : "none"} className={isPinned ? "text-or" : ""} />
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!confirm("Supprimer définitivement ce résultat ?")) return;
          start(async () => {
            await deleteResultAction(id);
            push("Résultat supprimé.", "succes");
            router.push("/resultats");
          });
        }}
        aria-label="Supprimer ce résultat"
        className="rounded-lg p-2 text-ivoire-faint transition-colors hover:bg-erreur/10 hover:text-erreur"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}

export function MarkAllReadButton({ disabled }: { disabled: boolean }) {
  const [pending, start] = useTransition();
  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={disabled}
      loading={pending}
      icon={<Check size={15} />}
      onClick={() => start(() => markAllReadAction())}
    >
      Tout marquer comme lu
    </Button>
  );
}
