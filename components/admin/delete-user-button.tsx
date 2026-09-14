"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteUser } from "@/lib/actions/users";

export function DeleteUserButton({ userId, userLabel }: { userId: string; userLabel: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = () => {
    if (!confirm(`Supprimer définitivement le compte de ${userLabel} ? Cette action est irréversible.`)) return;
    setError(null);
    startTransition(async () => {
      try {
        await deleteUser(userId);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Suppression impossible.");
      }
    });
  };

  return (
    <div className="flex justify-end">
      <button
        onClick={handleDelete}
        disabled={isPending}
        title="Supprimer ce compte"
        className="text-ivoire-dim hover:text-red-400 disabled:opacity-40"
      >
        <Trash2 size={15} />
      </button>
      {error && <p className="ml-2 text-xs text-red-400">{error}</p>}
    </div>
  );
}
