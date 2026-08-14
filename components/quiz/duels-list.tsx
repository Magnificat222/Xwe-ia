"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, Swords, X } from "lucide-react";

interface DuelEntry {
  id: string;
  status: string;
  stage: { title: string; slug: string };
  challenger: { id: string; name: string | null; email: string };
  opponent: { id: string; name: string | null; email: string };
  challengerAttempt: { totalScore: number; completedAt: string | null } | null;
  opponentAttempt: { totalScore: number; completedAt: string | null } | null;
  winnerId: string | null;
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: "En attente",
  COMPLETED: "Terminé",
  DECLINED: "Refusé",
  EXPIRED: "Expiré",
};

export function DuelsList({ duels: initialDuels, myUserId }: { duels: DuelEntry[]; myUserId: string }) {
  const [duels, setDuels] = useState(initialDuels);

  const decline = async (duelId: string) => {
    const res = await fetch(`/api/quiz/duels/${duelId}/decline`, { method: "POST" });
    if (res.ok) {
      setDuels((prev) => prev.map((d) => (d.id === duelId ? { ...d, status: "DECLINED" } : d)));
    }
  };

  if (duels.length === 0) {
    return (
      <p className="text-sm text-ivoire-dim">
        Aucun défi pour l'instant — allez sur une étape de l'arène pour en lancer un.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {duels.map((duel) => {
        const isChallenger = duel.challenger.id === myUserId;
        const opponentName = isChallenger
          ? duel.opponent.name ?? duel.opponent.email
          : duel.challenger.name ?? duel.challenger.email;
        const iAmWinner = duel.winnerId === myUserId;
        const isDraw = duel.status === "COMPLETED" && !duel.winnerId;

        return (
          <div key={duel.id} className="rounded-lg border border-ivoire/10 bg-noir-elevated/40 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Swords size={15} className="text-or" />
                <p className="text-sm text-ivoire">
                  {isChallenger ? "Vous avez défié" : "Défié par"} <strong>{opponentName}</strong>
                </p>
              </div>
              <span className="text-xs text-ivoire-dim">{duel.stage.title}</span>
            </div>

            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-ivoire-dim">
                {STATUS_LABEL[duel.status] ?? duel.status}
                {duel.status === "COMPLETED" && (
                  <span className="ml-2 font-medium text-or">
                    {isDraw ? "Égalité" : iAmWinner ? "Vous avez gagné" : "Défaite"}
                  </span>
                )}
              </p>

              <div className="flex gap-2">
                {duel.status === "PENDING" && !isChallenger && (
                  <button
                    type="button"
                    onClick={() => decline(duel.id)}
                    className="inline-flex items-center gap-1 rounded-full border border-ivoire/15 px-3 py-1 text-xs text-ivoire-dim hover:text-red-400"
                  >
                    <X size={12} /> Refuser
                  </button>
                )}
                {duel.status === "PENDING" && (
                  <Link href={`/quiz/${duel.stage.slug}?duel=${duel.id}`}>
                    <span className="inline-flex items-center gap-1 rounded-full bg-or px-3 py-1 text-xs font-medium text-noir">
                      <Check size={12} /> Jouer
                    </span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
